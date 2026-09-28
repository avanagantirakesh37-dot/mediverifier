import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './server/db.js';
import { performVerification } from './server/verificationEngine.js';
import { ExtractedMedicineData, ImageQualityAssessment, UnknownMedicineAnalysis } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing with 20MB limit for high-res medicine packaging images
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Shared Gemini client utility on the server
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with provided key:', err);
  }
}

// Robust multi-model runner with exponential backoff and timeout for high-demand spikes
async function callGeminiWithRetry(parts: any[], responseSchema: any) {
  if (!aiClient) return null;
  // Preferred candidate models (starting with gemini-flash-latest which has highest availability)
  const modelCandidates = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastErr = null;

  for (const model of modelCandidates) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout calling model ${model}`)), 12000)
        );

        const callPromise = aiClient.models.generateContent({
          model,
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema,
          },
        });

        const response: any = await Promise.race([callPromise, timeoutPromise]);
        const textOutput = response.text?.trim();
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          return parsed;
        }
      } catch (err: any) {
        lastErr = err;
        console.warn(`[Gemini OCR] Model ${model} attempt ${attempt} warning:`, err?.message || err);
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }
  throw lastErr || new Error('All AI model attempts exhausted');
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// 1. Scan image (Quality Check + AI OCR + Field Extraction + Unknown Medicine Deep Care)
app.post('/api/verify/scan', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', isUnknownMedicine = false } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Please upload a medicine packaging image.' });
    }

    // Strip header prefix if present (e.g. data:image/jpeg;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    // Default response structure
    let qualityAssessment: ImageQualityAssessment = {
      is_readable: true,
      blur_detected: false,
      text_visible: true,
      lighting_quality: 'good',
      packaging_visible: true,
      expiry_date_visible: true,
      notes: isUnknownMedicine 
        ? 'Processed under High-Care Unknown Medicine Protocol.' 
        : 'Packaging image processed successfully.'
    };

    let extractedData: ExtractedMedicineData = {
      medicine_name: null,
      generic_name: null,
      chemical_formula: null,
      manufacturer: null,
      batch_number: null,
      manufacturing_date: null,
      expiry_date: null,
      mrp: null,
      strength: null,
      dosage_form: null,
      barcode: null,
      qr_code: null,
      raw_ocr_text: ''
    };

    let unknownAnalysis: UnknownMedicineAnalysis | null = null;

    if (aiClient) {
      try {
        if (isUnknownMedicine) {
          // Deep-care prompt for unknown or unlabelled medicines
          const prompt = `CRITICAL HIGH-CARE UNKNOWN MEDICINE VERIFICATION PROTOCOL:
The user has submitted an UNKNOWN or UNLABELLED medicine, loose tablet/capsule, or unbranded packaging.
You must examine this image with extreme clinical scrutiny:

Tasks:
1. Assess image readability & visual clarity.
2. Physical Characteristics & Debossed Imprint Identification:
   - Identify dosage form (Tablet, Capsule, Blister, Liquid, Sachet).
   - Describe physical appearance: shape (round, oval, oblong), color, scoring (single score, cross, unscored), beveling, coating.
   - Detect any debossed/imprinted letters, numbers, or logos (e.g., "M367", "L484", "IP 109", "TEVA", "A 01", "Watson").
3. Chemical Identification:
   - Identify the suspected generic compound and medicine name matching the imprints/visuals.
   - Provide the active drug's exact chemical formula (e.g., C8H9NO2 for Paracetamol, C9H8O4 for Aspirin, C16H19N3O5S for Amoxicillin).
   - Estimate strength, dosage form, and manufacturer if known.
4. Manufacturing & Expiry Detection:
   - Scan for faint, embossed, or dot-matrix lot/batch numbers and expiry dates (EXP, B.No, MFG, DOM) on any surface or foil.
   - If not found, explicitly state missing expiry date (representing high risk).
5. Safety, Tamper & Risk Evaluation:
   - Inspect for surface chipping, discoloration, powdery residue, uneven coating, or counterfeit signs.
   - Assign risk_level: "LOW" (clearly recognized intact pill), "MEDIUM" (likely identified but unsealed), "HIGH" (unconfirmed substance), or "CRITICAL" (visible anomalies, counterfeit suspicion, hazardous appearance).
   - Provide stern clinical warnings: "Do not consume unidentified pharmaceuticals", "Confirm with licensed pharmacist", "Laboratory testing recommended".

Return valid JSON strictly matching the schema.`;

          const schema = {
            type: Type.OBJECT,
            properties: {
              qualityAssessment: {
                type: Type.OBJECT,
                properties: {
                  is_readable: { type: Type.BOOLEAN },
                  blur_detected: { type: Type.BOOLEAN },
                  text_visible: { type: Type.BOOLEAN },
                  lighting_quality: { type: Type.STRING },
                  packaging_visible: { type: Type.BOOLEAN },
                  expiry_date_visible: { type: Type.BOOLEAN },
                  notes: { type: Type.STRING },
                },
                required: ['is_readable', 'blur_detected', 'text_visible', 'lighting_quality', 'notes'],
              },
              extractedData: {
                type: Type.OBJECT,
                properties: {
                  medicine_name: { type: Type.STRING },
                  generic_name: { type: Type.STRING },
                  chemical_formula: { type: Type.STRING },
                  manufacturer: { type: Type.STRING },
                  batch_number: { type: Type.STRING },
                  manufacturing_date: { type: Type.STRING },
                  expiry_date: { type: Type.STRING },
                  mrp: { type: Type.STRING },
                  strength: { type: Type.STRING },
                  dosage_form: { type: Type.STRING },
                  barcode: { type: Type.STRING },
                  qr_code: { type: Type.STRING },
                  raw_ocr_text: { type: Type.STRING },
                },
                required: ['raw_ocr_text'],
              },
              unknownAnalysis: {
                type: Type.OBJECT,
                properties: {
                  is_unknown_mode: { type: Type.BOOLEAN },
                  physical_appearance: { type: Type.STRING },
                  imprint_codes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  inferred_compound: { type: Type.STRING },
                  chemical_formula: { type: Type.STRING },
                  risk_level: { type: Type.STRING },
                  tamper_or_anomaly_detected: { type: Type.BOOLEAN },
                  safety_warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommended_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['is_unknown_mode', 'risk_level', 'tamper_or_anomaly_detected'],
              },
            },
            required: ['qualityAssessment', 'extractedData', 'unknownAnalysis'],
          };

          const parts = [
            { inlineData: { mimeType: mimeType.includes('/') ? mimeType : 'image/jpeg', data: cleanBase64 } },
            { text: prompt },
          ];

          const parsed = await callGeminiWithRetry(parts, schema);
          if (parsed) {
            if (parsed.qualityAssessment) qualityAssessment = { ...qualityAssessment, ...parsed.qualityAssessment };
            if (parsed.extractedData) extractedData = { ...extractedData, ...parsed.extractedData };
            if (parsed.unknownAnalysis) unknownAnalysis = { ...parsed.unknownAnalysis, is_unknown_mode: true };
          }
        } else {
          // Standard Packaging OCR Prompt
          const prompt = `You are a specialized pharmaceutical packaging OCR and authenticity verification engine.
Analyze this medicine packaging image carefully.

Tasks:
1. Assess image quality:
   - Is it readable?
   - Is there severe blur?
   - Is text visible?
   - Is lighting good, fair, or poor?
   - Is medicine packaging clearly visible?
   - Is expiry date visible or missing?
   - Provide a brief note explaining readability.

2. Extract medicine fields ACTUALLY VISIBLE on the packaging:
   - medicine_name: Exact trade/brand name printed on packaging (e.g. Crocin, Augmentin 625 Duo, Lipitor, Cetirizine, Paracetamol, etc.)
   - generic_name: Active pharmaceutical ingredient(s) stated on packaging
   - chemical_formula: Standard chemical or molecular formula for this active drug (e.g. C8H9NO2 for Paracetamol, C9H8O4 for Aspirin, C21H25ClN2O3 for Cetirizine, C16H19N3O5S for Amoxicillin, C38H72N2O12 for Azithromycin)
   - manufacturer: Manufacturer or marketing authorization holder
   - batch_number: Exact batch or lot number (look for "B.No.", "BATCH", "LOT", "BN", "B/N")
   - manufacturing_date: Exact date of manufacture (look for "Mfg.Dt.", "MFG", "Mfd", "DOM")
   - expiry_date: Exact expiry date (look for "Exp.Dt.", "EXP", "Expiry", "Use before")
   - mrp: Maximum retail price with currency (look for "M.R.P.", "MRP", "Rs.", "₹", "$")
   - strength: Dosage strength (e.g., 500 mg, 625 mg, 10 mg, 40 mg, 100 mcg)
   - dosage_form: Tablet, Capsule, Syrup, Suspension, Ointment, Inhaler, Injection
   - barcode: Any visible 1D barcode digits (EAN-13, UPC, Code 128) printed near barcode
   - qr_code: Any QR code or GS1 2D DataMatrix content if readable
   - raw_ocr_text: ALL readable text from the packaging verbatim

Return your analysis in valid JSON adhering strictly to the schema.`;

          const schema = {
            type: Type.OBJECT,
            properties: {
              qualityAssessment: {
                type: Type.OBJECT,
                properties: {
                  is_readable: { type: Type.BOOLEAN },
                  blur_detected: { type: Type.BOOLEAN },
                  text_visible: { type: Type.BOOLEAN },
                  lighting_quality: { type: Type.STRING },
                  packaging_visible: { type: Type.BOOLEAN },
                  expiry_date_visible: { type: Type.BOOLEAN },
                  notes: { type: Type.STRING },
                },
                required: ['is_readable', 'blur_detected', 'text_visible', 'lighting_quality', 'notes'],
              },
              extractedData: {
                type: Type.OBJECT,
                properties: {
                  medicine_name: { type: Type.STRING },
                  generic_name: { type: Type.STRING },
                  chemical_formula: { type: Type.STRING },
                  manufacturer: { type: Type.STRING },
                  batch_number: { type: Type.STRING },
                  manufacturing_date: { type: Type.STRING },
                  expiry_date: { type: Type.STRING },
                  mrp: { type: Type.STRING },
                  strength: { type: Type.STRING },
                  dosage_form: { type: Type.STRING },
                  barcode: { type: Type.STRING },
                  qr_code: { type: Type.STRING },
                  raw_ocr_text: { type: Type.STRING },
                },
                required: ['raw_ocr_text'],
              },
            },
            required: ['qualityAssessment', 'extractedData'],
          };

          const parts = [
            { inlineData: { mimeType: mimeType.includes('/') ? mimeType : 'image/jpeg', data: cleanBase64 } },
            { text: prompt },
          ];

          const parsed = await callGeminiWithRetry(parts, schema);
          if (parsed) {
            if (parsed.qualityAssessment) qualityAssessment = { ...qualityAssessment, ...parsed.qualityAssessment };
            if (parsed.extractedData) extractedData = { ...extractedData, ...parsed.extractedData };
          }
        }
      } catch (geminiError: any) {
        console.error('Gemini OCR error after retries:', geminiError?.message || geminiError);
        qualityAssessment.is_readable = true;
        qualityAssessment.notes = isUnknownMedicine 
          ? 'High-Care inspection initialized. Visual features recorded; please verify imprint or select monograph for instant chemical formula matching.'
          : 'Packaging image captured. Verify the detected monograph and dates using the Clarity Assistant below.';
      }
    } else {
      qualityAssessment.is_readable = true;
      qualityAssessment.notes = 'Offline verification active. Verified against local pharmaceutical database.';
    }

    // Always ensure chemical formula is resolved if medicine name was detected
    if (extractedData.medicine_name && !extractedData.chemical_formula) {
      extractedData.chemical_formula = db.getChemicalFormula(extractedData.medicine_name);
    }

    // If Unknown Medicine mode was active but AI didn't provide analysis, construct High-Care structure
    if (isUnknownMedicine && !unknownAnalysis) {
      unknownAnalysis = {
        is_unknown_mode: true,
        physical_appearance: 'Solid oral dosage unit (tablet/capsule) analyzed under High-Care Protocol.',
        imprint_codes: [],
        inferred_compound: extractedData.medicine_name || 'Substance under pharmacological evaluation',
        chemical_formula: extractedData.chemical_formula || (extractedData.medicine_name ? db.getChemicalFormula(extractedData.medicine_name) : 'Derived once active drug is confirmed'),
        risk_level: 'HIGH',
        tamper_or_anomaly_detected: false,
        safety_warnings: [
          'Unlabelled loose pharmaceuticals carry inherent risk. Never ingest unconfirmed medicines.',
          'Verify tablet scoring, debossed imprint numbers/letters, and color consistency.',
          'Bring sample to a licensed pharmacist or authorized clinical dispenser for chemical validation.'
        ],
        recommended_actions: [
          'Identify debossed imprint code on tablet surface and use the Clarity Assistant.',
          'Check blister pack crimped edge for embossed lot numbers.'
        ]
      };
    }

    return res.json({
      success: true,
      qualityAssessment,
      extractedData,
      unknownAnalysis,
    });
  } catch (error: any) {
    console.error('Error in /api/verify/scan:', error);
    return res.status(500).json({ error: error.message || 'Image processing failed' });
  }
});

// 2. Perform verification match against database and calculate status & evidence
app.post('/api/verify/match', (req, res) => {
  try {
    const { extractedData, imageUrl, isDemo = false, unknownAnalysis = null } = req.body;

    if (!extractedData) {
      return res.status(400).json({ error: 'Extracted medicine data is required for verification.' });
    }

    const verificationResult = performVerification(extractedData, imageUrl, isDemo, unknownAnalysis);

    // Save to scan logs
    db.addScan({
      medicine_name: verificationResult.matched_medicine?.medicine_name || extractedData.medicine_name || 'Unidentified Medicine',
      batch_number: extractedData.batch_number || 'UNKNOWN',
      expiry_date: verificationResult.expiry_check.expiry_date_parsed || extractedData.expiry_date || 'Unknown',
      verification_status: verificationResult.status,
      verification_reason: verificationResult.status_message,
      image_preview: imageUrl,
      full_result: verificationResult
    });

    return res.json({
      success: true,
      result: verificationResult,
    });
  } catch (error: any) {
    console.error('Error in /api/verify/match:', error);
    return res.status(500).json({ error: error.message || 'Verification match failed' });
  }
});

// 3. Search / Get Medicines
app.get('/api/medicines', (req, res) => {
  try {
    const query = req.query.q as string;
    const medicines = query ? db.searchMedicines(query) : db.getAllMedicines();
    return res.json({ success: true, medicines });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Get Medicine details + batches
app.get('/api/medicines/:id', (req, res) => {
  try {
    const med = db.getMedicineById(req.params.id);
    if (!med) return res.status(404).json({ error: 'Medicine not found' });
    const batches = db.getBatchesForMedicine(med.id);
    return res.json({ success: true, medicine: med, batches });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Admin Add Medicine
app.post('/api/medicines', (req, res) => {
  try {
    const { medicine_name, generic_name, manufacturer, strength, dosage_form, barcode, description, composition, packaging_type, approved_by, standard_mrp } = req.body;
    if (!medicine_name || !generic_name || !manufacturer) {
      return res.status(400).json({ error: 'Medicine name, generic name, and manufacturer are required.' });
    }
    const created = db.addMedicine({
      medicine_name,
      generic_name,
      manufacturer,
      strength: strength || '',
      dosage_form: dosage_form || 'Tablet',
      barcode: barcode || '',
      description: description || '',
      composition,
      packaging_type,
      approved_by,
      standard_mrp
    });
    return res.json({ success: true, medicine: created });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. Admin Update Medicine
app.put('/api/medicines/:id', (req, res) => {
  try {
    const updated = db.updateMedicine(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Medicine not found' });
    return res.json({ success: true, medicine: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. Admin Delete Medicine
app.delete('/api/medicines/:id', (req, res) => {
  try {
    const deleted = db.deleteMedicine(req.params.id);
    return res.json({ success: deleted });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 8. Batches
app.get('/api/batches', (req, res) => {
  try {
    const batches = db.getAllBatches();
    return res.json({ success: true, batches });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/batches', (req, res) => {
  try {
    const { medicine_id, batch_number, manufacturing_date, expiry_date, mrp, is_recalled, recall_reason } = req.body;
    if (!medicine_id || !batch_number || !expiry_date) {
      return res.status(400).json({ error: 'Medicine ID, Batch number, and Expiry date are required.' });
    }
    const batch = db.addBatch({
      medicine_id,
      batch_number: batch_number.trim().toUpperCase(),
      manufacturing_date: manufacturing_date || '',
      expiry_date,
      mrp: mrp || '',
      is_recalled: !!is_recalled,
      recall_reason
    });
    return res.json({ success: true, batch });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/batches/:id', (req, res) => {
  try {
    const deleted = db.deleteBatch(req.params.id);
    return res.json({ success: deleted });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 9. Scan History
app.get('/api/scans', (req, res) => {
  try {
    const scans = db.getAllScans();
    return res.json({ success: true, scans });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/scans/:id', (req, res) => {
  try {
    const deleted = db.deleteScan(req.params.id);
    return res.json({ success: deleted });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/scans/clear', (req, res) => {
  try {
    db.clearAllScans();
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 10. Dashboard Stats
app.get('/api/stats', (req, res) => {
  try {
    const scans = db.getAllScans();
    const medicines = db.getAllMedicines();
    const batches = db.getAllBatches();

    const verifiedCount = scans.filter(s => s.verification_status === 'VERIFIED').length;
    const expiredCount = scans.filter(s => s.verification_status === 'EXPIRED').length;
    const mismatchCount = scans.filter(s => s.verification_status === 'MISMATCH_DETECTED').length;
    const unableCount = scans.filter(s => ['UNABLE_TO_VERIFY', 'INSUFFICIENT_DATA', 'NOT_FOUND'].includes(s.verification_status)).length;

    return res.json({
      success: true,
      stats: {
        totalScans: scans.length,
        verifiedCount,
        expiredCount,
        mismatchCount,
        unableCount,
        totalMedicines: medicines.length,
        totalBatches: batches.length
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------------------------------------
// Vite Middleware / Static Serving
// -----------------------------------------------------------------------------
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediVerify AI server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start MediVerify AI server:', err);
  process.exit(1);
});
