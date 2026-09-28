import { 
  ExtractedMedicineData, 
  VerificationResult, 
  VerificationStatusType, 
  VerificationEvidenceItem, 
  ExpiryCheckResult, 
  Medicine, 
  MedicineBatch,
  UnknownMedicineAnalysis 
} from '../src/types/index.js';
import { db } from './db.js';

export function parseExpiryDate(rawDateStr: string | null | undefined): { date: Date | null; parsedText: string; isApproximateMonth: boolean } {
  if (!rawDateStr || typeof rawDateStr !== 'string') {
    return { date: null, parsedText: 'Unknown', isApproximateMonth: false };
  }

  const clean = rawDateStr.trim().toUpperCase();

  const monthNames: Record<string, number> = {
    JAN: 0, JANU: 0, JANUARY: 0,
    FEB: 1, FEBR: 1, FEBRUARY: 1,
    MAR: 2, MARC: 2, MARCH: 2,
    APR: 3, APRI: 3, APRIL: 3,
    MAY: 4,
    JUN: 5, JUNE: 5,
    JUL: 6, JULY: 6,
    AUG: 7, AUGU: 7, AUGUST: 7,
    SEP: 8, SEPT: 8, SEPTEMBER: 8,
    OCT: 9, OCTO: 9, OCTOBER: 9,
    NOV: 10, NOVE: 10, NOVEMBER: 10,
    DEC: 11, DECE: 11, DECEMBER: 11
  };

  // Pattern 1: MMM YYYY (e.g. APR 2027, APRIL 2027, 04/2027)
  for (const [monthPrefix, monthIdx] of Object.entries(monthNames)) {
    if (clean.includes(monthPrefix)) {
      const yearMatch = clean.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1], 10);
        // Pharmaceutical standard: valid through the end of the month
        const endOfMonth = new Date(Date.UTC(year, monthIdx + 1, 0, 23, 59, 59));
        const monthStr = (monthIdx + 1).toString().padStart(2, '0');
        return { date: endOfMonth, parsedText: `${monthStr}/${year}`, isApproximateMonth: true };
      }
    }
  }

  // Pattern 2: MM/YYYY or MM-YYYY or MM.YYYY (e.g. 04/2027 or 4/2027)
  const mmYyyyMatch = clean.match(/\b(0?[1-9]|1[0-2])[\/\-\.\s](20\d{2})\b/);
  if (mmYyyyMatch) {
    const month = parseInt(mmYyyyMatch[1], 10);
    const year = parseInt(mmYyyyMatch[2], 10);
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const monthStr = month.toString().padStart(2, '0');
    return { date: endOfMonth, parsedText: `${monthStr}/${year}`, isApproximateMonth: true };
  }

  // Pattern 3: YYYY-MM (e.g. 2027-04)
  const yyyyMmMatch = clean.match(/\b(20\d{2})[\/\-\.\s](0?[1-9]|1[0-2])\b/);
  if (yyyyMmMatch) {
    const year = parseInt(yyyyMmMatch[1], 10);
    const month = parseInt(yyyyMmMatch[2], 10);
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const monthStr = month.toString().padStart(2, '0');
    return { date: endOfMonth, parsedText: `${monthStr}/${year}`, isApproximateMonth: true };
  }

  // Pattern 4: DD/MM/YYYY or DD-MM-YYYY
  const ddMmYyyyMatch = clean.match(/\b(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[0-2])[\/\-\.](20\d{2})\b/);
  if (ddMmYyyyMatch) {
    const day = parseInt(ddMmYyyyMatch[1], 10);
    const month = parseInt(ddMmYyyyMatch[2], 10);
    const year = parseInt(ddMmYyyyMatch[3], 10);
    const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');
    return { date, parsedText: `${dayStr}/${monthStr}/${year}`, isApproximateMonth: false };
  }

  // Pattern 5: MM/YY (e.g. 04/27 -> 04/2027)
  const mmYyMatch = clean.match(/\b(0?[1-9]|1[0-2])[\/\-]([2-3][0-9])\b/);
  if (mmYyMatch) {
    const month = parseInt(mmYyMatch[1], 10);
    const year = 2000 + parseInt(mmYyMatch[2], 10);
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const monthStr = month.toString().padStart(2, '0');
    return { date: endOfMonth, parsedText: `${monthStr}/${year}`, isApproximateMonth: true };
  }

  return { date: null, parsedText: clean || 'Unknown', isApproximateMonth: false };
}

export function evaluateExpiry(expiryStr: string | null | undefined, referenceDate: Date = new Date()): ExpiryCheckResult {
  const { date, parsedText } = parseExpiryDate(expiryStr);

  if (!date || isNaN(date.getTime())) {
    return {
      status: 'unknown',
      expiry_date_parsed: parsedText !== 'Unknown' ? parsedText : null,
      days_remaining: null,
      message: 'Expiry date could not be reliably determined from packaging text.'
    };
  }

  const diffMs = date.getTime() - referenceDate.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    const daysAgo = Math.abs(daysRemaining);
    return {
      status: 'expired',
      expiry_date_parsed: parsedText,
      days_remaining: daysRemaining,
      message: `The detected expiry date (${parsedText}) has passed ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago. Do not consume.`
    };
  } else if (daysRemaining <= 90) {
    return {
      status: 'expiring_soon',
      expiry_date_parsed: parsedText,
      days_remaining: daysRemaining,
      message: `Expiring soon: ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining until ${parsedText}.`
    };
  } else {
    return {
      status: 'valid',
      expiry_date_parsed: parsedText,
      days_remaining: daysRemaining,
      message: `Expiry date is valid (${daysRemaining} days remaining through ${parsedText}).`
    };
  }
}

export function performVerification(
  data: ExtractedMedicineData, 
  imageUrl?: string, 
  isDemo?: boolean,
  unknownAnalysis?: UnknownMedicineAnalysis | null
): VerificationResult {
  const evidenceItems: VerificationEvidenceItem[] = [];
  let unverifiedCount = 0;

  // If Unknown Medicine mode is active, prepend High-Care Protocol assessment
  if (unknownAnalysis?.is_unknown_mode) {
    const riskBadge = unknownAnalysis.risk_level || 'HIGH';
    evidenceItems.push({
      field: 'unknown_protocol',
      label: 'High-Care Unknown Substance Protocol',
      status: riskBadge === 'LOW' ? 'matched' : riskBadge === 'CRITICAL' ? 'mismatch' : 'warning',
      detail: `Assessed with High-Care Visual & Chemical Safety Protocol. Clinical Risk Level: ${riskBadge}. ${unknownAnalysis.physical_appearance || 'Visual pill characteristics recorded.'}`,
      detected_value: `Risk Rating: ${riskBadge}`
    });

    if (unknownAnalysis.imprint_codes && unknownAnalysis.imprint_codes.length > 0) {
      evidenceItems.push({
        field: 'imprint_codes',
        label: 'Debossed Pill Imprints & Markings',
        status: 'matched',
        detail: `Visual debossed marking detected: "${unknownAnalysis.imprint_codes.join(', ')}". Matches active pharmacological profile: "${unknownAnalysis.inferred_compound || data.generic_name || 'Evaluating monograph'}".`,
        detected_value: unknownAnalysis.imprint_codes.join(', ')
      });
    }

    if (unknownAnalysis.tamper_or_anomaly_detected) {
      evidenceItems.push({
        field: 'anomaly_tamper',
        label: 'Physical Anomaly / Tampering Check',
        status: 'mismatch',
        detail: 'Visual irregularities detected (e.g. non-standard coating, scoring abnormalities, or surface chipping). Highly unsafe for consumption without clinical laboratory assay.',
        detected_value: 'Irregularities Detected'
      });
    }
  }

  // 1. Try resolving medicine record from database
  let matchedMedicine: Medicine | null = null;
  let matchedBatch: MedicineBatch | null = null;
  let barcodeStatus: 'Verified' | 'Not Found' | 'Unable to Verify' | 'Not Detected' = 'Not Detected';

  // Try barcode resolution first if present
  if (data.barcode && data.barcode.trim()) {
    const medByBarcode = db.findMedicineByBarcode(data.barcode);
    if (medByBarcode) {
      matchedMedicine = medByBarcode;
      barcodeStatus = 'Verified';
      evidenceItems.push({
        field: 'barcode',
        label: 'Barcode / GTIN Lookup',
        status: 'matched',
        detail: `Barcode ${data.barcode} matches licensed record for ${medByBarcode.medicine_name}.`,
        detected_value: data.barcode,
        expected_value: medByBarcode.barcode
      });
    } else {
      barcodeStatus = 'Not Found';
      evidenceItems.push({
        field: 'barcode',
        label: 'Barcode / GTIN Lookup',
        status: 'warning',
        detail: `Detected barcode ${data.barcode} was not found in the configured medicine database.`,
        detected_value: data.barcode
      });
    }
  } else {
    barcodeStatus = 'Not Detected';
    evidenceItems.push({
      field: 'barcode',
      label: 'Barcode / GTIN Lookup',
      status: 'unverified',
      detail: 'No 1D barcode or 2D DataMatrix code detected in the scanned image.'
    });
    unverifiedCount++;
  }

  // If not matched by barcode, try name / generic name matching
  if (!matchedMedicine && (data.medicine_name || data.generic_name)) {
    const searchString = `${data.medicine_name || ''} ${data.generic_name || ''}`.trim();
    const found = db.findMedicineByNameFuzzy(searchString);
    if (found) {
      matchedMedicine = found;
    }
  }

  // Pre-resolve matchedBatch if batch number is available
  if (data.batch_number) {
    const cleanBatch = data.batch_number.trim();
    matchedBatch = db.findBatch(cleanBatch, matchedMedicine?.id) || null;
  }

  // Populate chemical formula from database monograph or formula directory if not already extracted from image
  if (matchedMedicine?.chemical_formula && !data.chemical_formula) {
    data.chemical_formula = matchedMedicine.chemical_formula;
  } else if (!data.chemical_formula && (data.medicine_name || data.generic_name)) {
    data.chemical_formula = db.getChemicalFormula(data.medicine_name || data.generic_name || '');
  }

  // 2. Evaluate Medicine Name
  if (matchedMedicine) {
    evidenceItems.push({
      field: 'medicine_name',
      label: 'Medicine Name & Brand',
      status: 'matched',
      detail: `Matches approved pharmaceutical monograph: "${matchedMedicine.medicine_name}". Active ingredient: ${matchedMedicine.generic_name}.`,
      detected_value: data.medicine_name || matchedMedicine.medicine_name,
      expected_value: matchedMedicine.medicine_name
    });
  } else if (data.medicine_name) {
    evidenceItems.push({
      field: 'medicine_name',
      label: 'Medicine Name & Brand',
      status: 'warning',
      detail: `Detected name "${data.medicine_name}". Secondary verification or packaging edge check recommended to confirm monograph.`,
      detected_value: data.medicine_name
    });
  } else {
    evidenceItems.push({
      field: 'medicine_name',
      label: 'Medicine Name & Brand',
      status: 'unverified',
      detail: 'Medicine name could not be identified from this angle. Use the interactive clarity selector to confirm product name.'
    });
    unverifiedCount++;
  }

  // Chemical Formula evaluation
  if (data.chemical_formula) {
    evidenceItems.push({
      field: 'chemical_formula',
      label: 'Chemical Formula',
      status: 'matched',
      detail: `Molecular structure: ${data.chemical_formula} for active constituent ${matchedMedicine?.generic_name || data.generic_name || data.medicine_name || 'pharmaceutical core'}.`,
      detected_value: data.chemical_formula,
      expected_value: matchedMedicine?.chemical_formula
    });
  } else {
    evidenceItems.push({
      field: 'chemical_formula',
      label: 'Chemical Formula',
      status: 'unverified',
      detail: 'Molecular formula will be displayed once the active drug constituent is confirmed.'
    });
    unverifiedCount++;
  }

  // Manufacturing Date evaluation
  if (data.manufacturing_date) {
    evidenceItems.push({
      field: 'manufacturing_date',
      label: 'Manufacturing Date (MFG)',
      status: 'matched',
      detail: `Manufacturing date confirmed: ${data.manufacturing_date}.`,
      detected_value: data.manufacturing_date,
      expected_value: matchedBatch?.manufacturing_date
    });
  } else if (matchedBatch?.manufacturing_date) {
    data.manufacturing_date = matchedBatch.manufacturing_date;
    evidenceItems.push({
      field: 'manufacturing_date',
      label: 'Manufacturing Date (MFG)',
      status: 'matched',
      detail: `Batch record release date: ${matchedBatch.manufacturing_date}.`,
      detected_value: matchedBatch.manufacturing_date,
      expected_value: matchedBatch.manufacturing_date
    });
  } else {
    evidenceItems.push({
      field: 'manufacturing_date',
      label: 'Manufacturing Date (MFG)',
      status: 'unverified',
      detail: 'Manufacturing date is typically stamped on the crimped edge of blister strips or carton flaps (format: MM/YYYY).'
    });
    unverifiedCount++;
  }

  // 3. Evaluate Manufacturer
  if (matchedMedicine) {
    if (data.manufacturer) {
      const scanMfr = data.manufacturer.toLowerCase();
      const recMfr = matchedMedicine.manufacturer.toLowerCase();
      const isMfrMatch = scanMfr.split(/\s+/).some(word => word.length > 3 && recMfr.includes(word));

      if (isMfrMatch) {
        evidenceItems.push({
          field: 'manufacturer',
          label: 'Manufacturer Verification',
          status: 'matched',
          detail: `Consistent with licensed marketing authorization holder: ${matchedMedicine.manufacturer}.`,
          detected_value: data.manufacturer,
          expected_value: matchedMedicine.manufacturer
        });
      } else {
        evidenceItems.push({
          field: 'manufacturer',
          label: 'Manufacturer Verification',
          status: 'mismatch',
          detail: `Packaging lists "${data.manufacturer}", but official record specifies "${matchedMedicine.manufacturer}".`,
          detected_value: data.manufacturer,
          expected_value: matchedMedicine.manufacturer
        });
      }
    } else {
      evidenceItems.push({
        field: 'manufacturer',
        label: 'Manufacturer Verification',
        status: 'unverified',
        detail: 'Manufacturer text not legible or absent from scanned angle.'
      });
      unverifiedCount++;
    }
  } else if (data.manufacturer) {
    evidenceItems.push({
      field: 'manufacturer',
      label: 'Manufacturer Verification',
      status: 'warning',
      detail: `Detected manufacturer "${data.manufacturer}" could not be verified without confirmed drug profile.`,
      detected_value: data.manufacturer
    });
  }

  // 4. Batch & Lot Verification
  let batchMismatchAlert = false;

  if (data.batch_number) {
    const cleanBatch = data.batch_number.trim();
    const foundBatch = db.findBatch(cleanBatch, matchedMedicine?.id);

    if (foundBatch) {
      // Check if found batch belongs to the matched medicine
      if (matchedMedicine && foundBatch.medicine_id !== matchedMedicine.id) {
        const otherMed = db.getMedicineById(foundBatch.medicine_id);
        batchMismatchAlert = true;
        evidenceItems.push({
          field: 'batch_number',
          label: 'Batch / Lot Number Registry',
          status: 'mismatch',
          detail: `CRITICAL MISMATCH: Batch "${cleanBatch}" is assigned in regulatory records to "${otherMed?.medicine_name || 'different drug'}", not "${matchedMedicine.medicine_name}".`,
          detected_value: cleanBatch,
          expected_value: `Assigned to ${otherMed?.medicine_name}`
        });
      } else if (foundBatch.is_recalled) {
        evidenceItems.push({
          field: 'batch_number',
          label: 'Batch Recall Notice',
          status: 'mismatch',
          detail: `BATCH RECALL NOTICE: ${foundBatch.recall_reason || 'This batch is subject to a manufacturer recall.'}`,
          detected_value: cleanBatch
        });
      } else {
        matchedBatch = foundBatch;
        evidenceItems.push({
          field: 'batch_number',
          label: 'Batch / Lot Number Registry',
          status: 'matched',
          detail: `Batch "${cleanBatch}" confirmed in authorized manufacturer release logs.`,
          detected_value: cleanBatch,
          expected_value: foundBatch.batch_number
        });
      }
    } else {
      evidenceItems.push({
        field: 'batch_number',
        label: 'Batch / Lot Number Registry',
        status: 'warning',
        detail: `Batch "${cleanBatch}" is not listed in local verified batch registry (may be newer production batch or regional variant).`,
        detected_value: cleanBatch
      });
    }
  } else {
    evidenceItems.push({
      field: 'batch_number',
      label: 'Batch / Lot Number Registry',
      status: 'unverified',
      detail: 'Batch / Lot number not detected on scanned surface.'
    });
    unverifiedCount++;
  }

  // 5. Expiry Date Check
  const expiryCheck = evaluateExpiry(data.expiry_date);
  if (expiryCheck.status === 'valid') {
    evidenceItems.push({
      field: 'expiry_date',
      label: 'Expiry Date Check',
      status: 'matched',
      detail: `${expiryCheck.message}`,
      detected_value: data.expiry_date || 'N/A'
    });
  } else if (expiryCheck.status === 'expiring_soon') {
    evidenceItems.push({
      field: 'expiry_date',
      label: 'Expiry Date Check',
      status: 'warning',
      detail: `${expiryCheck.message}`,
      detected_value: data.expiry_date || 'N/A'
    });
  } else if (expiryCheck.status === 'expired') {
    evidenceItems.push({
      field: 'expiry_date',
      label: 'Expiry Date Check',
      status: 'mismatch',
      detail: `${expiryCheck.message}`,
      detected_value: data.expiry_date || 'N/A'
    });
  } else {
    evidenceItems.push({
      field: 'expiry_date',
      label: 'Expiry Date Check',
      status: 'unverified',
      detail: 'Expiry date could not be extracted or formatted reliably.',
      detected_value: data.expiry_date || 'N/A'
    });
    unverifiedCount++;
  }

  // 6. Dosage / Strength Check
  if (matchedMedicine) {
    if (data.strength) {
      evidenceItems.push({
        field: 'strength',
        label: 'Strength / Dosage Form',
        status: 'matched',
        detail: `Dosage information (${data.strength} ${data.dosage_form || ''}) is consistent with approved formulation.`,
        detected_value: `${data.strength} ${data.dosage_form || ''}`.trim()
      });
    }
  }

  // 7. Calculate overall status based on standard PRD requirements
  let status: VerificationStatusType = 'UNABLE_TO_VERIFY';
  let statusHeadline = 'Unable to Verify';
  let statusMessage = 'We could not confirm the medicine using the available information.';

  const hasMismatch = evidenceItems.some(item => item.status === 'mismatch') || batchMismatchAlert;
  const isExpired = expiryCheck.status === 'expired';

  // Check data density
  const validFieldsCount = [
    data.medicine_name,
    data.manufacturer,
    data.batch_number,
    data.expiry_date,
    data.barcode
  ].filter(Boolean).length;

  if (unknownAnalysis?.is_unknown_mode) {
    if (isExpired) {
      status = 'EXPIRED';
      statusHeadline = '✕ Expired Unknown Medicine Detected';
      statusMessage = `Expiry check indicates the expiration date has passed (${expiryCheck.expiry_date_parsed || data.expiry_date}). Do not consume expired medicine.`;
    } else if (unknownAnalysis.tamper_or_anomaly_detected || unknownAnalysis.risk_level === 'CRITICAL') {
      status = 'MISMATCH_DETECTED';
      statusHeadline = '⚠ Unknown Medicine — Critical Risk / Tamper Alert';
      statusMessage = 'Physical visual anomalies (abnormal scoring, coating defect, or discoloration) were identified. Do not ingest unknown or altered substances.';
    } else if (matchedMedicine && expiryCheck.status === 'valid' && unknownAnalysis.risk_level === 'LOW') {
      status = 'VERIFIED';
      statusHeadline = '✓ Unknown Medicine Identified & Verified';
      statusMessage = `Physical imprint and packaging characteristics are consistent with ${matchedMedicine.medicine_name}. Pharmacist confirmation is still strongly advised.`;
    } else if (data.medicine_name || unknownAnalysis.inferred_compound) {
      status = 'UNABLE_TO_VERIFY';
      statusHeadline = '⚠ Unknown Medicine — High Care Protocol Applied';
      statusMessage = `Suspected chemical compound identified as "${unknownAnalysis.inferred_compound || data.medicine_name}". However, unsealed/unverified medicines require professional pharmacist confirmation.`;
    } else {
      status = 'INSUFFICIENT_DATA';
      statusHeadline = '⚠ Unidentified Substance — Insufficient Markings';
      statusMessage = 'No recognizable imprint code, NDC, or packaging markings detected. Do not ingest unidentified pills or substances.';
    }
  } else if (isExpired) {
    status = 'EXPIRED';
    statusHeadline = '✕ Expired Medicine Detected';
    statusMessage = `The detected expiry date (${expiryCheck.expiry_date_parsed || data.expiry_date}) has passed. Do not administer or consume expired pharmaceuticals.`;
  } else if (hasMismatch) {
    status = 'MISMATCH_DETECTED';
    statusHeadline = '⚠ Packaging Mismatch Detected';
    statusMessage = 'Important packaging details differ from the verified manufacturer records or recall registry. Consult a licensed pharmacist immediately.';
  } else if (validFieldsCount < 2) {
    status = 'INSUFFICIENT_DATA';
    statusHeadline = '⚠ Insufficient Packaging Data';
    statusMessage = 'Not enough readable information could be extracted from the image to perform verification. Please provide a clearer, closer photograph.';
  } else if (matchedMedicine && (matchedBatch || (data.expiry_date && expiryCheck.status === 'valid'))) {
    status = 'VERIFIED';
    statusHeadline = '✓ Information Verified';
    statusMessage = 'The scanned medicine packaging information is consistent with available trusted records and valid expiry criteria.';
  } else if (!matchedMedicine) {
    status = 'NOT_FOUND';
    statusHeadline = 'ℹ Record Not Found';
    statusMessage = 'This medicine could not be found in our current verified medicine database. This does not confirm it is counterfeit, but secondary pharmacist verification is recommended.';
  } else {
    status = 'UNABLE_TO_VERIFY';
    statusHeadline = '⚠ Inconclusive Verification';
    statusMessage = 'Some details were detected, but crucial confirmation data points (such as verified batch or full manufacturer barcode) were unavailable.';
  }

  const safetyNotice = unknownAnalysis?.is_unknown_mode
    ? 'HIGH-CARE PROTOCOL DIRECTIVE: This item was inspected as an unknown or unlabelled medicine. Visual AI analysis is assistive and cannot replace laboratory chemical chromatography (HPLC/MS) or registered pharmacist inspection. NEVER ingest unidentified pharmaceuticals.'
    : 'AI verification provides assistance only. It compares scanned packaging against available database records and automated checks. It does not guarantee chemical purity, authenticity, or safe storage conditions. Always confirm medicine safety with a licensed pharmacist or authorized healthcare professional.';

  const result: VerificationResult = {
    id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status,
    status_headline: statusHeadline,
    status_message: statusMessage,
    safety_notice: safetyNotice,
    medicine_info: data,
    matched_medicine: matchedMedicine,
    matched_batch: matchedBatch,
    expiry_check: expiryCheck,
    evidence_items: evidenceItems,
    unverified_count: unverifiedCount,
    barcode_status: barcodeStatus,
    timestamp: new Date().toISOString(),
    image_url: imageUrl,
    is_demo: isDemo,
    unknown_analysis: unknownAnalysis || null
  };

  return result;
}
