import { Medicine, MedicineBatch, ScanHistoryRecord } from '../src/types/index.js';

// In-memory persistent store with realistic pharmaceutical data
let medicines: Medicine[] = [
  {
    id: 'med-1',
    medicine_name: 'Paracetamol 500 mg (Crocin)',
    generic_name: 'Paracetamol / Acetaminophen',
    chemical_formula: 'C8H9NO2',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd.',
    strength: '500 mg',
    dosage_form: 'Tablet',
    barcode: '8901117002015',
    description: 'Analgesic and antipyretic for relief of mild to moderate pain and fever reduction.',
    composition: 'Each uncoated tablet contains: Paracetamol IP 500mg',
    packaging_type: 'Strip pack of 15 tablets (Blister)',
    approved_by: 'CDSCO / WHO-GMP',
    standard_mrp: '₹30.50',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z'
  },
  {
    id: 'med-2',
    medicine_name: 'Augmentin 625 Duo',
    generic_name: 'Amoxicillin & Potassium Clavulanate',
    chemical_formula: 'C16H19N3O5S · C8H9NO5',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd.',
    strength: '500 mg + 125 mg (625 mg total)',
    dosage_form: 'Film-coated Tablet',
    barcode: '5012345678900',
    description: 'Broad-spectrum antibiotic combination for bacterial infections of respiratory tract, skin, and soft tissue.',
    composition: 'Amoxicillin Trihydrate IP eq to Amoxicillin 500mg, Potassium Clavulanate Diluted IP eq to Clavulanic Acid 125mg',
    packaging_type: 'Strip of 10 tablets in aluminum foil pouch',
    approved_by: 'CDSCO / MHRA',
    standard_mrp: '₹201.20',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z'
  },
  {
    id: 'med-3',
    medicine_name: 'Azee 500',
    generic_name: 'Azithromycin',
    chemical_formula: 'C38H72N2O12',
    manufacturer: 'Cipla Ltd.',
    strength: '500 mg',
    dosage_form: 'Tablet',
    barcode: '8901086004521',
    description: 'Macrolide antibiotic used for treatment of susceptible bacterial infections.',
    composition: 'Azithromycin Dihydrate IP equivalent to anhydrous Azithromycin 500mg',
    packaging_type: 'Blister pack of 5 tablets',
    approved_by: 'CDSCO / US-FDA',
    standard_mrp: '₹119.50',
    created_at: '2025-02-15T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z'
  },
  {
    id: 'med-4',
    medicine_name: 'Cetirizine 10 mg',
    generic_name: 'Cetirizine Dihydrochloride',
    chemical_formula: 'C21H25ClN2O3 · 2HCl',
    manufacturer: "Dr. Reddy's Laboratories Ltd.",
    strength: '10 mg',
    dosage_form: 'Film-coated Tablet',
    barcode: '8901234567891',
    description: 'Second-generation antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, and itching.',
    composition: 'Cetirizine Dihydrochloride IP 10mg',
    packaging_type: 'Alu-Alu blister pack of 10 tablets',
    approved_by: 'CDSCO / EMA',
    standard_mrp: '₹45.00',
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2026-05-15T00:00:00Z'
  },
  {
    id: 'med-5',
    medicine_name: 'Lipitor 20 mg',
    generic_name: 'Atorvastatin Calcium',
    chemical_formula: 'C66H68CaF2N4O10',
    manufacturer: 'Viatris / Pfizer Inc.',
    strength: '20 mg',
    dosage_form: 'Film-coated Tablet',
    barcode: '0300450449168',
    description: 'HMG-CoA reductase inhibitor (statin) used to lower cholesterol and reduce risk of cardiovascular disease.',
    composition: 'Atorvastatin Calcium Trihydrate equivalent to Atorvastatin 20mg',
    packaging_type: 'Bottle of 30 tablets with child-resistant cap',
    approved_by: 'US-FDA / EMA',
    standard_mrp: '$48.00 / ₹420.00',
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z'
  },
  {
    id: 'med-6',
    medicine_name: 'Pan 40',
    generic_name: 'Pantoprazole Gastro-resistant',
    chemical_formula: 'C16H15F2N3O4S',
    manufacturer: 'Alkem Laboratories Ltd.',
    strength: '40 mg',
    dosage_form: 'Enteric-coated Tablet',
    barcode: '8901148200124',
    description: 'Proton pump inhibitor (PPI) for treatment of GERD, acid reflux, and peptic ulcer disease.',
    composition: 'Pantoprazole Sodium Sesquihydrate IP eq to Pantoprazole 40mg',
    packaging_type: 'Strip of 15 tablets',
    approved_by: 'CDSCO',
    standard_mrp: '₹155.00',
    created_at: '2025-04-12T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: 'med-7',
    medicine_name: 'Glycomet 500',
    generic_name: 'Metformin Hydrochloride',
    chemical_formula: 'C4H11N5 · HCl',
    manufacturer: 'USV Private Limited',
    strength: '500 mg',
    dosage_form: 'Tablet',
    barcode: '8901296001014',
    description: 'Biguanide antihyperglycemic agent for managing type 2 diabetes mellitus.',
    composition: 'Metformin Hydrochloride IP 500mg',
    packaging_type: 'Blister strip of 20 tablets',
    approved_by: 'CDSCO',
    standard_mrp: '₹42.50',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2026-03-10T00:00:00Z'
  },
  {
    id: 'med-8',
    medicine_name: 'Ventolin Evohaler',
    generic_name: 'Salbutamol Sulfate',
    chemical_formula: '(C13H21NO3)2 · H2SO4',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd.',
    strength: '100 mcg / actuation',
    dosage_form: 'Pressurised Inhalation Suspension',
    barcode: '5012345009876',
    description: 'Short-acting beta2-adrenergic agonist bronchodilator for relief of acute bronchospasm in asthma and COPD.',
    composition: 'Salbutamol Sulfate BP equivalent to Salbutamol 100mcg per actuation (200 actuations)',
    packaging_type: 'Aluminum canister with plastic actuator & dust cap',
    approved_by: 'MHRA / WHO-GMP',
    standard_mrp: '₹180.00 / £9.80',
    created_at: '2025-03-15T00:00:00Z',
    updated_at: '2026-06-20T00:00:00Z'
  },
  {
    id: 'med-9',
    medicine_name: 'Dolo 650',
    generic_name: 'Paracetamol / Acetaminophen 650mg',
    chemical_formula: 'C8H9NO2',
    manufacturer: 'Micro Labs Limited',
    strength: '650 mg',
    dosage_form: 'Tablet',
    barcode: '8901235006501',
    description: 'Analgesic and antipyretic for relief of fever, headache, body ache, and mild-to-moderate pain.',
    composition: 'Each uncoated tablet contains: Paracetamol IP 650mg',
    packaging_type: 'Blister strip of 15 tablets',
    approved_by: 'CDSCO',
    standard_mrp: '₹34.00',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2026-05-10T00:00:00Z'
  },
  {
    id: 'med-10',
    medicine_name: 'Brufen 400',
    generic_name: 'Ibuprofen',
    chemical_formula: 'C13H18O2',
    manufacturer: 'Abbott Healthcare Pvt. Ltd.',
    strength: '400 mg',
    dosage_form: 'Film-coated Tablet',
    barcode: '8901034004001',
    description: 'Non-steroidal anti-inflammatory drug (NSAID) for inflammatory pain, dental pain, and musculoskeletal disorders.',
    composition: 'Ibuprofen IP 400mg',
    packaging_type: 'Blister strip of 15 tablets',
    approved_by: 'CDSCO / WHO-GMP',
    standard_mrp: '₹22.50',
    created_at: '2025-02-10T00:00:00Z',
    updated_at: '2026-06-12T00:00:00Z'
  },
  {
    id: 'med-11',
    medicine_name: 'Disprin Regular (Aspirin)',
    generic_name: 'Acetylsalicylic Acid (Aspirin)',
    chemical_formula: 'C9H8O4',
    manufacturer: 'Reckitt Benckiser Healthcare',
    strength: '350 mg',
    dosage_form: 'Effervescent Tablet',
    barcode: '8901396003502',
    description: 'Soluble analgesic, antipyretic, and anti-inflammatory tablet for quick relief of headache and migraine.',
    composition: 'Aspirin IP 350mg',
    packaging_type: 'Foil strip of 10 effervescent tablets',
    approved_by: 'CDSCO',
    standard_mrp: '₹14.80',
    created_at: '2025-01-18T00:00:00Z',
    updated_at: '2026-07-02T00:00:00Z'
  },
  {
    id: 'med-12',
    medicine_name: 'Cifran 500',
    generic_name: 'Ciprofloxacin Hydrochloride',
    chemical_formula: 'C17H18FN3O3 · HCl',
    manufacturer: 'Sun Pharmaceutical Industries Ltd.',
    strength: '500 mg',
    dosage_form: 'Film-coated Tablet',
    barcode: '8901079005008',
    description: 'Fluoroquinolone broad-spectrum antimicrobial for urinary tract, respiratory, and gastrointestinal infections.',
    composition: 'Ciprofloxacin Hydrochloride IP eq to Ciprofloxacin 500mg',
    packaging_type: 'Blister pack of 10 tablets',
    approved_by: 'CDSCO / US-FDA',
    standard_mrp: '₹48.90',
    created_at: '2025-03-20T00:00:00Z',
    updated_at: '2026-05-18T00:00:00Z'
  },
  {
    id: 'med-13',
    medicine_name: 'Omez 20',
    generic_name: 'Omeprazole Gastro-resistant',
    chemical_formula: 'C17H19N3O3S',
    manufacturer: "Dr. Reddy's Laboratories Ltd.",
    strength: '20 mg',
    dosage_form: 'Hard Gelatin Capsule',
    barcode: '8901234000204',
    description: 'Proton pump inhibitor reducing stomach acid for acid reflux, ulcers, and heartburn.',
    composition: 'Omeprazole IP 20mg (as enteric coated pellets)',
    packaging_type: 'Alu-Alu blister pack of 15 capsules',
    approved_by: 'CDSCO / US-FDA',
    standard_mrp: '₹89.00',
    created_at: '2025-02-12T00:00:00Z',
    updated_at: '2026-04-22T00:00:00Z'
  },
  {
    id: 'med-14',
    medicine_name: 'Hydrocodone / Acetaminophen (Imprint M367)',
    generic_name: 'Hydrocodone Bitartrate and Acetaminophen',
    chemical_formula: 'C18H21NO3 · C8H9NO2',
    manufacturer: 'Mallinckrodt Pharmaceuticals',
    strength: '10 mg / 325 mg',
    dosage_form: 'Oval White Tablet (Score Line & Imprint M367)',
    barcode: '00406036701',
    description: 'Prescription opioid analgesic combination for moderate to severe acute pain. High regulatory scrutiny required.',
    composition: 'Hydrocodone Bitartrate 10mg, Acetaminophen 325mg',
    packaging_type: 'Prescription pharmacy bottle / loose tablet',
    approved_by: 'US-FDA (Schedule II)',
    standard_mrp: '$32.00',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z'
  },
  {
    id: 'med-15',
    medicine_name: 'Acetaminophen 500 mg Tablet (Imprint L484)',
    generic_name: 'Acetaminophen / Paracetamol',
    chemical_formula: 'C8H9NO2',
    manufacturer: 'Perrigo / Kroger Co.',
    strength: '500 mg',
    dosage_form: 'White Oblong / Oval Tablet (Imprint L484)',
    barcode: '041226048401',
    description: 'Over-the-counter pain reliever and fever reducer identified by debossed imprint L484.',
    composition: 'Acetaminophen 500mg',
    packaging_type: 'HDPE bottle of 100 caplets / loose tablet',
    approved_by: 'US-FDA OTC',
    standard_mrp: '$8.50',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z'
  }
];

let batches: MedicineBatch[] = [
  // Paracetamol batches
  {
    id: 'bat-1',
    medicine_id: 'med-1',
    batch_number: 'PCM2604',
    manufacturing_date: '04/2026',
    expiry_date: '03/2028',
    mrp: '₹30.50',
    is_recalled: false,
    created_at: '2026-04-10T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z'
  },
  {
    id: 'bat-dolo-1',
    medicine_id: 'med-9',
    batch_number: 'DLO2601',
    manufacturing_date: '01/2026',
    expiry_date: '12/2028',
    mrp: '₹34.00',
    is_recalled: false,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'bat-bru-1',
    medicine_id: 'med-10',
    batch_number: 'BRU2511',
    manufacturing_date: '11/2025',
    expiry_date: '10/2028',
    mrp: '₹22.50',
    is_recalled: false,
    created_at: '2025-11-20T00:00:00Z',
    updated_at: '2025-11-20T00:00:00Z'
  },
  {
    id: 'bat-cif-1',
    medicine_id: 'med-12',
    batch_number: 'CFN2603',
    manufacturing_date: '03/2026',
    expiry_date: '02/2028',
    mrp: '₹48.90',
    is_recalled: false,
    created_at: '2026-03-25T00:00:00Z',
    updated_at: '2026-03-25T00:00:00Z'
  },
  {
    id: 'bat-omz-1',
    medicine_id: 'med-13',
    batch_number: 'OMZ2602',
    manufacturing_date: '02/2026',
    expiry_date: '01/2028',
    mrp: '₹89.00',
    is_recalled: false,
    created_at: '2026-02-18T00:00:00Z',
    updated_at: '2026-02-18T00:00:00Z'
  },
  {
    id: 'bat-m367-1',
    medicine_id: 'med-14',
    batch_number: 'MAL2507',
    manufacturing_date: '07/2025',
    expiry_date: '06/2027',
    mrp: '$32.00',
    is_recalled: false,
    created_at: '2025-07-01T00:00:00Z',
    updated_at: '2025-07-01T00:00:00Z'
  },
  {
    id: 'bat-l484-1',
    medicine_id: 'med-15',
    batch_number: 'PRG2604',
    manufacturing_date: '04/2026',
    expiry_date: '03/2029',
    mrp: '$8.50',
    is_recalled: false,
    created_at: '2026-04-10T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z'
  },
  {
    id: 'bat-2',
    medicine_id: 'med-1',
    batch_number: 'PCM2510',
    manufacturing_date: '10/2025',
    expiry_date: '09/2027',
    mrp: '₹30.00',
    is_recalled: false,
    created_at: '2025-10-15T00:00:00Z',
    updated_at: '2025-10-15T00:00:00Z'
  },
  {
    id: 'bat-3',
    medicine_id: 'med-1',
    batch_number: 'PCM2302',
    manufacturing_date: '02/2023',
    expiry_date: '01/2025',
    mrp: '₹28.00',
    is_recalled: false,
    created_at: '2023-02-15T00:00:00Z',
    updated_at: '2023-02-15T00:00:00Z'
  },

  // Augmentin batches
  {
    id: 'bat-4',
    medicine_id: 'med-2',
    batch_number: 'AUG2608',
    manufacturing_date: '05/2026',
    expiry_date: '11/2027',
    mrp: '₹201.20',
    is_recalled: false,
    created_at: '2026-05-20T00:00:00Z',
    updated_at: '2026-05-20T00:00:00Z'
  },
  {
    id: 'bat-5',
    medicine_id: 'med-2',
    batch_number: 'AUG2401',
    manufacturing_date: '01/2024',
    expiry_date: '06/2025', // EXPIRED
    mrp: '₹195.00',
    is_recalled: false,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'bat-6',
    medicine_id: 'med-2',
    batch_number: 'AUG-REC-88',
    manufacturing_date: '03/2025',
    expiry_date: '09/2026',
    mrp: '₹198.00',
    is_recalled: true,
    recall_reason: 'Alert by National Drug Authority: Sub-potency defect detected during stability testing. Voluntary manufacturer recall.',
    created_at: '2025-03-12T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z'
  },

  // Azee batches
  {
    id: 'bat-7',
    medicine_id: 'med-3',
    batch_number: 'AZ26011',
    manufacturing_date: '01/2026',
    expiry_date: '12/2027',
    mrp: '₹119.50',
    is_recalled: false,
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z'
  },
  {
    id: 'bat-8',
    medicine_id: 'med-3',
    batch_number: 'AZ24080',
    manufacturing_date: '08/2024',
    expiry_date: '07/2026', // EXPIRED
    mrp: '₹115.00',
    is_recalled: false,
    created_at: '2024-08-15T00:00:00Z',
    updated_at: '2024-08-15T00:00:00Z'
  },

  // Cetirizine batches
  {
    id: 'bat-9',
    medicine_id: 'med-4',
    batch_number: 'DRC2607',
    manufacturing_date: '02/2026',
    expiry_date: '08/2028',
    mrp: '₹45.00',
    is_recalled: false,
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-02-10T00:00:00Z'
  },
  {
    id: 'bat-10',
    medicine_id: 'med-4',
    batch_number: 'DRC2509',
    manufacturing_date: '09/2025',
    expiry_date: '10/2026', // EXPIRING SOON (approx 1 month from Sept 2026)
    mrp: '₹42.00',
    is_recalled: false,
    created_at: '2025-09-12T00:00:00Z',
    updated_at: '2025-09-12T00:00:00Z'
  },

  // Lipitor batch
  {
    id: 'bat-11',
    medicine_id: 'med-5',
    batch_number: 'LIP2699',
    manufacturing_date: '03/2026',
    expiry_date: '03/2028',
    mrp: '$48.00',
    is_recalled: false,
    created_at: '2026-03-15T00:00:00Z',
    updated_at: '2026-03-15T00:00:00Z'
  },

  // Pan 40 batch
  {
    id: 'bat-12',
    medicine_id: 'med-6',
    batch_number: 'ALK2615',
    manufacturing_date: '04/2026',
    expiry_date: '03/2028',
    mrp: '₹155.00',
    is_recalled: false,
    created_at: '2026-04-18T00:00:00Z',
    updated_at: '2026-04-18T00:00:00Z'
  },

  // Metformin batch
  {
    id: 'bat-13',
    medicine_id: 'med-7',
    batch_number: 'GLY2603',
    manufacturing_date: '03/2026',
    expiry_date: '02/2028',
    mrp: '₹42.50',
    is_recalled: false,
    created_at: '2026-03-05T00:00:00Z',
    updated_at: '2026-03-05T00:00:00Z'
  },

  // Ventolin batch
  {
    id: 'bat-14',
    medicine_id: 'med-8',
    batch_number: 'VTN2602',
    manufacturing_date: '02/2026',
    expiry_date: '01/2028',
    mrp: '₹180.00',
    is_recalled: false,
    created_at: '2026-02-14T00:00:00Z',
    updated_at: '2026-02-14T00:00:00Z'
  }
];

let scans: ScanHistoryRecord[] = [
  {
    id: 'scan-init-1',
    medicine_name: 'Paracetamol 500 mg (Crocin)',
    batch_number: 'PCM2604',
    expiry_date: '03/2028',
    verification_status: 'VERIFIED',
    verification_reason: 'Scanned packaging details match manufacturer record and batch registry. Expiry valid through March 2028.',
    scan_timestamp: '2026-09-28T08:15:00Z'
  },
  {
    id: 'scan-init-2',
    medicine_name: 'Augmentin 625 Duo',
    batch_number: 'AUG2401',
    expiry_date: '06/2025',
    verification_status: 'EXPIRED',
    verification_reason: 'Detected expiry date (June 2025) has passed. Medicine is expired and unsafe to consume.',
    scan_timestamp: '2026-09-27T16:40:00Z'
  },
  {
    id: 'scan-init-3',
    medicine_name: 'Cetirizine 10 mg',
    batch_number: 'BATCH-FAKE-99',
    expiry_date: '12/2027',
    verification_status: 'MISMATCH_DETECTED',
    verification_reason: 'Batch BATCH-FAKE-99 does not belong to Dr. Reddy\'s Cetirizine 10mg product line in the manufacturer registry.',
    scan_timestamp: '2026-09-26T11:20:00Z'
  }
];

export const db = {
  // Medicines
  getAllMedicines: (): Medicine[] => [...medicines],
  
  getMedicineById: (id: string): Medicine | undefined => 
    medicines.find(m => m.id === id),
    
  searchMedicines: (query: string): Medicine[] => {
    const q = query.trim().toLowerCase();
    if (!q) return medicines;
    return medicines.filter(m => 
      m.medicine_name.toLowerCase().includes(q) ||
      m.generic_name.toLowerCase().includes(q) ||
      m.manufacturer.toLowerCase().includes(q) ||
      m.barcode.toLowerCase().includes(q) ||
      m.strength.toLowerCase().includes(q)
    );
  },

  findMedicineByBarcode: (barcode: string): Medicine | undefined => {
    const clean = barcode.replace(/[^0-9A-Za-z]/g, '').trim();
    if (!clean) return undefined;
    return medicines.find(m => m.barcode.replace(/[^0-9A-Za-z]/g, '') === clean);
  },

  findMedicineByNameFuzzy: (name: string): Medicine | undefined => {
    if (!name) return undefined;
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
    
    // Direct or substring match first
    for (const m of medicines) {
      const targetName = m.medicine_name.toLowerCase();
      const targetGeneric = m.generic_name.toLowerCase();
      if (cleanName.includes(targetName) || targetName.includes(cleanName)) return m;
      if (cleanName.includes(targetGeneric) || targetGeneric.includes(cleanName)) return m;
    }

    // Common brand / chemical alias map
    const aliasMap: Record<string, string> = {
      'crocin': 'med-1',
      'paracetamol': 'med-1',
      'acetaminophen': 'med-1',
      'calpol': 'med-1',
      'panadol': 'med-1',
      'tylenol': 'med-1',
      'dolo': 'med-9',
      'dolo 650': 'med-9',
      'dolo650': 'med-9',
      'augmentin': 'med-2',
      'clavam': 'med-2',
      'amoxicillin': 'med-2',
      'amoxil': 'med-2',
      'azee': 'med-3',
      'azithromycin': 'med-3',
      'zithromax': 'med-3',
      'cetirizine': 'med-4',
      'cetzine': 'med-4',
      'zyrtec': 'med-4',
      'alerid': 'med-4',
      'lipitor': 'med-5',
      'atorvastatin': 'med-5',
      'atorva': 'med-5',
      'pan': 'med-6',
      'pan 40': 'med-6',
      'pan40': 'med-6',
      'pantoprazole': 'med-6',
      'pantocid': 'med-6',
      'glycomet': 'med-7',
      'metformin': 'med-7',
      'glucophage': 'med-7',
      'ventolin': 'med-8',
      'salbutamol': 'med-8',
      'albuterol': 'med-8',
      'brufen': 'med-10',
      'ibuprofen': 'med-10',
      'advil': 'med-10',
      'motrin': 'med-10',
      'disprin': 'med-11',
      'aspirin': 'med-11',
      'ecosprin': 'med-11',
      'cifran': 'med-12',
      'cipro': 'med-12',
      'ciprofloxacin': 'med-12',
      'cirox': 'med-12',
      'omez': 'med-13',
      'omeprazole': 'med-13',
      'prilosec': 'med-13',
      'm367': 'med-14',
      'norco': 'med-14',
      'vicodin': 'med-14',
      'hydrocodone': 'med-14',
      'l484': 'med-15'
    };

    // Check aliases
    for (const [alias, medId] of Object.entries(aliasMap)) {
      if (cleanName.includes(alias) || alias.includes(cleanName)) {
        const found = medicines.find(m => m.id === medId);
        if (found) return found;
      }
    }

    // Token overlap check
    const inputTokens = cleanName.split(/\s+/).filter(t => t.length > 2);
    let bestMatch: Medicine | undefined = undefined;
    let maxOverlap = 0;

    for (const m of medicines) {
      const mTokens = `${m.medicine_name} ${m.generic_name} ${m.manufacturer}`.toLowerCase().split(/\s+/);
      let overlap = 0;
      for (const token of inputTokens) {
        if (mTokens.some(mt => mt.includes(token) || token.includes(mt))) {
          overlap++;
        }
      }
      if (overlap > maxOverlap && overlap >= 1) {
        maxOverlap = overlap;
        bestMatch = m;
      }
    }

    return bestMatch;
  },

  getChemicalFormula: (medicineOrGeneric: string): string => {
    if (!medicineOrGeneric) return 'Chemical formula calculated upon drug identification';
    const lower = medicineOrGeneric.toLowerCase();
    
    // Formula registry
    const formulas: [RegExp, string][] = [
      [/paracetamol|acetaminophen|crocin|dolo|calpol|tylenol|panadol|l484/i, 'C8H9NO2'],
      [/augmentin|amoxicillin.*clavulanate|clavam/i, 'C16H19N3O5S · C8H9NO5'],
      [/amoxicillin|amoxil/i, 'C16H19N3O5S'],
      [/azithromycin|azee|zithromax/i, 'C38H72N2O12'],
      [/cetirizine|zyrtec|cetzine|alerid/i, 'C21H25ClN2O3 · 2HCl'],
      [/atorvastatin|lipitor|atorva/i, 'C66H68CaF2N4O10'],
      [/pantoprazole|pan 40|pan40|pantocid|protonix/i, 'C16H15F2N3O4S'],
      [/metformin|glycomet|glucophage/i, 'C4H11N5 · HCl'],
      [/salbutamol|albuterol|ventolin/i, '(C13H21NO3)2 · H2SO4'],
      [/ibuprofen|brufen|advil|motrin/i, 'C13H18O2'],
      [/aspirin|acetylsalicylic|disprin|ecosprin/i, 'C9H8O4'],
      [/ciprofloxacin|cifran|cipro/i, 'C17H18FN3O3 · HCl'],
      [/omeprazole|omez|prilosec/i, 'C17H19N3O3S'],
      [/m367|hydrocodone.*acetaminophen|norco|vicodin/i, 'C18H21NO3 · C8H9NO2'],
      [/diclofenac|voveran|voltaren/i, 'C14H10Cl2NNaO2'],
      [/losartan|cozaar/i, 'C22H22ClKN6O'],
      [/levothyroxine|synthroid|eltroxin/i, 'C15H11I4NO4'],
      [/montelukast|singulair|montair/i, 'C35H36ClNO3S'],
      [/doxycycline|vibramycin/i, 'C22H24N2O8'],
      [/telmisartan|micardis|telma/i, 'C33H30N4O2']
    ];

    for (const [pattern, formula] of formulas) {
      if (pattern.test(lower)) return formula;
    }

    return 'CnHmNpOq (Derived active molecular composition)';
  },

  addMedicine: (data: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>): Medicine => {
    const newMed: Medicine = {
      ...data,
      id: `med-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    medicines.unshift(newMed);
    return newMed;
  },

  updateMedicine: (id: string, updates: Partial<Medicine>): Medicine | null => {
    const idx = medicines.findIndex(m => m.id === id);
    if (idx === -1) return null;
    medicines[idx] = {
      ...medicines[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return medicines[idx];
  },

  deleteMedicine: (id: string): boolean => {
    const initialLen = medicines.length;
    medicines = medicines.filter(m => m.id !== id);
    batches = batches.filter(b => b.medicine_id !== id);
    return medicines.length < initialLen;
  },

  // Batches
  getAllBatches: (): MedicineBatch[] => [...batches],

  getBatchesForMedicine: (medicineId: string): MedicineBatch[] => 
    batches.filter(b => b.medicine_id === medicineId),

  findBatch: (batchNumber: string, medicineId?: string): MedicineBatch | undefined => {
    const clean = batchNumber.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!clean) return undefined;
    
    if (medicineId) {
      const match = batches.find(b => 
        b.medicine_id === medicineId && 
        b.batch_number.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '') === clean
      );
      if (match) return match;
    }

    return batches.find(b => 
      b.batch_number.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '') === clean
    );
  },

  addBatch: (data: Omit<MedicineBatch, 'id' | 'created_at' | 'updated_at'>): MedicineBatch => {
    const newBatch: MedicineBatch = {
      ...data,
      id: `bat-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    batches.unshift(newBatch);
    return newBatch;
  },

  updateBatch: (id: string, updates: Partial<MedicineBatch>): MedicineBatch | null => {
    const idx = batches.findIndex(b => b.id === id);
    if (idx === -1) return null;
    batches[idx] = {
      ...batches[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return batches[idx];
  },

  deleteBatch: (id: string): boolean => {
    const initialLen = batches.length;
    batches = batches.filter(b => b.id !== id);
    return batches.length < initialLen;
  },

  // Scans
  getAllScans: (): ScanHistoryRecord[] => [...scans],

  addScan: (scan: Omit<ScanHistoryRecord, 'id' | 'scan_timestamp'> & { scan_timestamp?: string }): ScanHistoryRecord => {
    const newRecord: ScanHistoryRecord = {
      ...scan,
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      scan_timestamp: scan.scan_timestamp || new Date().toISOString()
    };
    scans.unshift(newRecord);
    return newRecord;
  },

  deleteScan: (id: string): boolean => {
    const initialLen = scans.length;
    scans = scans.filter(s => s.id !== id);
    return scans.length < initialLen;
  },

  clearAllScans: () => {
    scans = [];
  }
};
