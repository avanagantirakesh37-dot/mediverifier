export interface Medicine {
  id: string;
  medicine_name: string;
  generic_name: string;
  chemical_formula?: string; // e.g. "C8H9NO2"
  manufacturer: string;
  strength: string;
  dosage_form: string;
  barcode: string;
  description: string;
  composition?: string;
  packaging_type?: string;
  approved_by?: string;
  standard_mrp?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicineBatch {
  id: string;
  medicine_id: string;
  batch_number: string;
  manufacturing_date: string; // e.g. "05/2025"
  expiry_date: string; // e.g. "04/2027"
  mrp: string;
  is_recalled: boolean;
  recall_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ImageQualityAssessment {
  is_readable: boolean;
  blur_detected: boolean;
  text_visible: boolean;
  lighting_quality: 'good' | 'fair' | 'poor';
  packaging_visible: boolean;
  expiry_date_visible: boolean;
  notes: string;
}

export interface ExtractedMedicineData {
  medicine_name: string | null;
  generic_name: string | null;
  chemical_formula: string | null;
  manufacturer: string | null;
  batch_number: string | null;
  manufacturing_date: string | null;
  expiry_date: string | null;
  mrp: string | null;
  strength: string | null;
  dosage_form: string | null;
  barcode: string | null;
  qr_code: string | null;
  raw_ocr_text: string;
}

export type EvidenceStatus = 'matched' | 'mismatch' | 'not_found' | 'warning' | 'unverified';

export interface VerificationEvidenceItem {
  field: string;
  label: string;
  status: EvidenceStatus;
  detail: string;
  detected_value?: string;
  expected_value?: string;
}

export type ExpiryStatus = 'valid' | 'expired' | 'expiring_soon' | 'unknown';

export interface ExpiryCheckResult {
  status: ExpiryStatus;
  expiry_date_parsed: string | null;
  days_remaining: number | null;
  message: string;
}

export type VerificationStatusType = 
  | 'VERIFIED'
  | 'EXPIRED'
  | 'MISMATCH_DETECTED'
  | 'NOT_FOUND'
  | 'INSUFFICIENT_DATA'
  | 'UNABLE_TO_VERIFY';

export interface UnknownMedicineAnalysis {
  is_unknown_mode: boolean;
  physical_appearance?: string; // shape, color, scoring, coating
  imprint_codes?: string[]; // debossed letters/numbers on pill
  inferred_compound?: string; // suspected active agent
  chemical_formula?: string; // molecular formula
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tamper_or_anomaly_detected: boolean;
  safety_warnings: string[];
  recommended_actions: string[];
}

export interface VerificationResult {
  id: string;
  status: VerificationStatusType;
  status_headline: string;
  status_message: string;
  safety_notice: string;
  medicine_info: ExtractedMedicineData;
  matched_medicine?: Medicine | null;
  matched_batch?: MedicineBatch | null;
  expiry_check: ExpiryCheckResult;
  evidence_items: VerificationEvidenceItem[];
  unverified_count: number;
  barcode_status: 'Verified' | 'Not Found' | 'Unable to Verify' | 'Not Detected';
  timestamp: string;
  image_url?: string;
  is_demo?: boolean;
  unknown_analysis?: UnknownMedicineAnalysis | null;
}

export interface ScanHistoryRecord {
  id: string;
  user_id?: string;
  medicine_name: string;
  batch_number: string;
  expiry_date: string;
  verification_status: VerificationStatusType;
  verification_reason: string;
  scan_timestamp: string;
  image_preview?: string;
  full_result?: VerificationResult;
}

export interface DemoSample {
  id: string;
  title: string;
  subtitle: string;
  expectedStatus: VerificationStatusType;
  badgeColor: string;
  description: string;
  medicineData: ExtractedMedicineData;
  imagePlaceholderUrl: string;
  svgDataUri?: string;
  notes: string;
}
