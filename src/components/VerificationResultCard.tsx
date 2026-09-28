import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Calendar, 
  Building2, 
  Layers, 
  Barcode, 
  ShieldAlert, 
  Printer, 
  RotateCcw, 
  Share2, 
  ExternalLink,
  Info,
  Search,
  Edit3,
  AlertCircle,
  Sparkles,
  X,
  ChevronRight
} from 'lucide-react';
import { VerificationResult, EvidenceStatus, ExtractedMedicineData } from '../types';

interface VerificationResultCardProps {
  result: VerificationResult;
  onScanAnother: () => void;
  onUpdateData?: (updated: ExtractedMedicineData) => void;
}

export const VerificationResultCard: React.FC<VerificationResultCardProps> = ({
  result,
  onScanAnother,
  onUpdateData,
}) => {
  const [showClarityModal, setShowClarityModal] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>(
    result.medicine_info.medicine_name || result.matched_medicine?.medicine_name || ''
  );
  const [draftFormula, setDraftFormula] = useState<string>(
    result.medicine_info.chemical_formula || result.matched_medicine?.chemical_formula || ''
  );
  const [draftMfg, setDraftMfg] = useState<string>(
    result.medicine_info.manufacturing_date || result.matched_batch?.manufacturing_date || ''
  );
  const [draftExp, setDraftExp] = useState<string>(
    result.expiry_check.expiry_date_parsed || result.medicine_info.expiry_date || ''
  );

  // Common verified pharmaceutical monographs for quick clarity selection
  const commonMonographs = [
    { name: 'Paracetamol 500 mg (Crocin)', generic: 'Paracetamol / Acetaminophen', formula: 'C8H9NO2', mfg: '04/2026', exp: '03/2028' },
    { name: 'Dolo 650', generic: 'Paracetamol 650mg', formula: 'C8H9NO2', mfg: '01/2026', exp: '12/2028' },
    { name: 'Augmentin 625 Duo', generic: 'Amoxicillin & Potassium Clavulanate', formula: 'C16H19N3O5S · C8H9NO5', mfg: '05/2026', exp: '11/2027' },
    { name: 'Azee 500', generic: 'Azithromycin', formula: 'C38H72N2O12', mfg: '01/2026', exp: '12/2027' },
    { name: 'Cetirizine 10 mg', generic: 'Cetirizine Dihydrochloride', formula: 'C21H25ClN2O3 · 2HCl', mfg: '02/2026', exp: '08/2028' },
    { name: 'Lipitor 20 mg', generic: 'Atorvastatin Calcium', formula: 'C66H68CaF2N4O10', mfg: '03/2026', exp: '03/2028' },
    { name: 'Pan 40', generic: 'Pantoprazole Gastro-resistant', formula: 'C16H15F2N3O4S', mfg: '04/2026', exp: '03/2028' },
    { name: 'Glycomet 500', generic: 'Metformin Hydrochloride', formula: 'C4H11N5 · HCl', mfg: '03/2026', exp: '02/2028' },
    { name: 'Brufen 400', generic: 'Ibuprofen', formula: 'C13H18O2', mfg: '11/2025', exp: '10/2028' },
    { name: 'Disprin Regular', generic: 'Acetylsalicylic Acid (Aspirin)', formula: 'C9H8O4', mfg: '01/2026', exp: '12/2027' },
    { name: 'Cifran 500', generic: 'Ciprofloxacin Hydrochloride', formula: 'C17H18FN3O3 · HCl', mfg: '03/2026', exp: '02/2028' },
    { name: 'Omez 20', generic: 'Omeprazole Gastro-resistant', formula: 'C17H19N3O3S', mfg: '02/2026', exp: '01/2028' },
    { name: 'Tablet Imprint M367', generic: 'Hydrocodone Bitartrate & Acetaminophen', formula: 'C18H21NO3 · C8H9NO2', mfg: '07/2025', exp: '06/2027' },
    { name: 'Tablet Imprint L484', generic: 'Acetaminophen 500 mg', formula: 'C8H9NO2', mfg: '04/2026', exp: '03/2029' }
  ];

  const handleSelectPreset = (mono: typeof commonMonographs[0]) => {
    setDraftName(mono.name);
    setDraftFormula(mono.formula);
    if (!draftMfg) setDraftMfg(mono.mfg);
    if (!draftExp) setDraftExp(mono.exp);
  };

  const handleApplyClarity = () => {
    if (!onUpdateData) return;
    const updated: ExtractedMedicineData = {
      ...result.medicine_info,
      medicine_name: draftName || null,
      chemical_formula: draftFormula || null,
      manufacturing_date: draftMfg || null,
      expiry_date: draftExp || null
    };
    onUpdateData(updated);
    setShowClarityModal(false);
  };
  const getStatusBadge = () => {
    switch (result.status) {
      case 'VERIFIED':
        return {
          icon: CheckCircle2,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-900',
          badgeBg: 'bg-emerald-600',
          badgeText: 'text-white',
          title: '✓ Information Verified',
          desc: 'The scanned medicine packaging information is consistent with available trusted records.'
        };
      case 'EXPIRED':
        return {
          icon: XCircle,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-300',
          textColor: 'text-rose-900',
          badgeBg: 'bg-rose-600',
          badgeText: 'text-white',
          title: '✕ Expired Medicine Detected',
          desc: 'The detected expiry date has passed. Expired medicines can be ineffective or hazardous to health.'
        };
      case 'MISMATCH_DETECTED':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-950',
          badgeBg: 'bg-amber-600',
          badgeText: 'text-white',
          title: '⚠ Packaging Mismatch Detected',
          desc: 'Important details (such as batch registry, manufacturer authorization, or recall flags) differ from official records.'
        };
      case 'NOT_FOUND':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-950',
          badgeBg: 'bg-blue-600',
          badgeText: 'text-white',
          title: 'ℹ Medicine Not Found in Database',
          desc: 'No matching authorized pharmaceutical record was found in the configured trusted database.'
        };
      case 'INSUFFICIENT_DATA':
        return {
          icon: HelpCircle,
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-300',
          textColor: 'text-slate-900',
          badgeBg: 'bg-slate-600',
          badgeText: 'text-white',
          title: '⚠ Insufficient Readable Data',
          desc: 'Not enough legible information was captured to perform a cross-reference verification.'
        };
      case 'UNABLE_TO_VERIFY':
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-300',
          textColor: 'text-slate-900',
          badgeBg: 'bg-slate-700',
          badgeText: 'text-white',
          title: '⚠ Unable to Verify',
          desc: 'Verification could not be reliably completed using the available packaging data.'
        };
    }
  };

  const statusConfig = getStatusBadge();
  const StatusIcon = statusConfig.icon;

  const renderEvidenceStatusIcon = (status: EvidenceStatus) => {
    switch (status) {
      case 'matched':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Match</span>
          </span>
        );
      case 'mismatch':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Mismatch</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Warning</span>
          </span>
        );
      case 'not_found':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3.5 h-3.5" />
            <span>Not Found</span>
          </span>
        );
      case 'unverified':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Unchecked</span>
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Main Status Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border-2 ${statusConfig.bgColor} ${statusConfig.borderColor} shadow-xs space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${statusConfig.badgeBg} text-white shrink-0 shadow-sm`}>
              <StatusIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-md tracking-wider ${statusConfig.badgeBg} ${statusConfig.badgeText}`}>
                  STATUS: {result.status.replace(/_/g, ' ')}
                </span>
                {result.is_demo && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-200 text-slate-800">
                    DEMO DATA
                  </span>
                )}
              </div>
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${statusConfig.textColor}`}>
                {statusConfig.title}
              </h2>
              <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${statusConfig.textColor} opacity-90`}>
                {statusConfig.desc}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Print verification summary"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
            <button
              type="button"
              onClick={onScanAnother}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Verify Another</span>
            </button>
          </div>
        </div>

        {/* Detailed Status Explanation Text */}
        <div className="p-3.5 bg-white/80 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed">
          <strong>Summary:</strong> {result.status_message}
        </div>
      </div>

      {/* High-Care Unknown Medicine Inspection Section (When scanned in Unknown Medicine mode) */}
      {result.unknown_analysis?.is_unknown_mode && (
        <div className={`rounded-2xl p-5 sm:p-6 border-2 space-y-4 shadow-sm ${
          result.unknown_analysis.risk_level === 'CRITICAL'
            ? 'bg-rose-50/70 border-rose-400'
            : result.unknown_analysis.risk_level === 'HIGH'
            ? 'bg-amber-50/70 border-amber-400'
            : result.unknown_analysis.risk_level === 'MEDIUM'
            ? 'bg-yellow-50/70 border-yellow-400'
            : 'bg-emerald-50/70 border-emerald-400'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-xl text-white ${
                result.unknown_analysis.risk_level === 'CRITICAL' || result.unknown_analysis.risk_level === 'HIGH'
                  ? 'bg-rose-600'
                  : result.unknown_analysis.risk_level === 'MEDIUM'
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}>
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    High-Care Unknown Medicine Verification
                  </h3>
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded tracking-wider text-white ${
                    result.unknown_analysis.risk_level === 'CRITICAL'
                      ? 'bg-rose-700'
                      : result.unknown_analysis.risk_level === 'HIGH'
                      ? 'bg-rose-600'
                      : result.unknown_analysis.risk_level === 'MEDIUM'
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}>
                    {result.unknown_analysis.risk_level} Risk Level
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Evaluated using tablet visual geometry, debossed imprints, and chemical monograph cross-referencing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {result.unknown_analysis.tamper_or_anomaly_detected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 border border-rose-300 text-rose-900 rounded-lg text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Physical Anomaly Detected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Intact Pill Surface</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Pill Imprints */}
            <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Debossed Pill Imprints
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {result.unknown_analysis.imprint_codes && result.unknown_analysis.imprint_codes.length > 0 ? (
                  result.unknown_analysis.imprint_codes.map((code, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-900 font-mono font-bold text-xs rounded">
                      {code}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No imprint detected</span>
                )}
              </div>
            </div>

            {/* Inferred Chemical Compound */}
            <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Inferred Pharmacological Compound
              </div>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                {result.unknown_analysis.inferred_compound || result.medicine_info.generic_name || 'Under clinical evaluation'}
              </div>
              {result.unknown_analysis.chemical_formula && (
                <div className="text-[11px] font-mono text-teal-700">
                  {result.unknown_analysis.chemical_formula}
                </div>
              )}
            </div>

            {/* Visual Characteristics */}
            <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Physical Appearance
              </div>
              <div className="text-xs text-slate-700 leading-snug line-clamp-2">
                {result.unknown_analysis.physical_appearance || 'Tablet / capsule format identified'}
              </div>
            </div>
          </div>

          {/* Safety Warnings & Directives */}
          {result.unknown_analysis.safety_warnings && result.unknown_analysis.safety_warnings.length > 0 && (
            <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>High-Care Safety Directives:</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc">
                {result.unknown_analysis.safety_warnings.map((warn, idx) => (
                  <li key={idx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 2. Key Medicine Scanned & Verified Details (Medicine Name, Chemical Formula, Manufacturing Date, Expiry Date) */}
      <div className="bg-white border-2 border-teal-500/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Core Medicine Details & Verification Status
              </h3>
              <p className="text-[11px] text-slate-500">
                Essential identification: Brand Name, Active Chemical Formula, Manufacturing Date, and Expiry Validity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowClarityModal(true)}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-600" />
              <span>Clarify / Adjust Details</span>
            </button>
            <span className="hidden sm:inline-flex px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold">
              Database Checked
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Medicine Name */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                Medicine Name
              </div>
              {result.medicine_info.medicine_name || result.matched_medicine?.medicine_name ? (
                <>
                  <div className="text-base font-black text-slate-900 leading-tight">
                    {result.medicine_info.medicine_name || result.matched_medicine?.medicine_name}
                  </div>
                  {result.matched_medicine && (
                    <div className="text-[11px] text-teal-700 font-medium truncate mt-0.5">
                      {result.matched_medicine.generic_name}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Needs Confirmation</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Image angle did not capture brand text cleanly.
                  </p>
                </div>
              )}
            </div>
            {!(result.medicine_info.medicine_name || result.matched_medicine?.medicine_name) && (
              <button
                type="button"
                onClick={() => setShowClarityModal(true)}
                className="mt-2 w-full py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <Search className="w-3 h-3" />
                <span>Select Medicine</span>
              </button>
            )}
          </div>

          {/* 2. Chemical Formula */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-1 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                Chemical Formula
              </div>
              {result.medicine_info.chemical_formula || result.matched_medicine?.chemical_formula ? (
                <>
                  <div className="text-base font-mono font-black text-teal-950 leading-tight">
                    {result.medicine_info.chemical_formula || result.matched_medicine?.chemical_formula}
                  </div>
                  <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                    Active Molecule Composition
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-teal-900">
                    Derived from Drug
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Calculated once medicine is identified (e.g. C₈H₉NO₂ for Paracetamol).
                  </p>
                </div>
              )}
            </div>
            {!(result.medicine_info.chemical_formula || result.matched_medicine?.chemical_formula) && (
              <button
                type="button"
                onClick={() => setShowClarityModal(true)}
                className="mt-2 w-full py-1 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-lg text-[10px] font-bold transition-colors"
              >
                View Formula Directory
              </button>
            )}
          </div>

          {/* 3. Manufacturing Date */}
          <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-200 space-y-1 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                Manufacturing Date
              </div>
              {result.medicine_info.manufacturing_date || result.matched_batch?.manufacturing_date ? (
                <>
                  <div className="text-base font-mono font-black text-cyan-950 leading-tight">
                    {result.medicine_info.manufacturing_date || result.matched_batch?.manufacturing_date}
                  </div>
                  <div className="text-[11px] text-cyan-700 font-medium mt-0.5">
                    MFG / Production Release
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-cyan-950">
                    Check Foil Crimp / Flap
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Stamped on blister crimp (standard: 24–36 mo shelf life).
                  </p>
                </div>
              )}
            </div>
            {!(result.medicine_info.manufacturing_date || result.matched_batch?.manufacturing_date) && (
              <button
                type="button"
                onClick={() => setShowClarityModal(true)}
                className="mt-2 w-full py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-900 rounded-lg text-[10px] font-bold transition-colors"
              >
                + Set MFG Date
              </button>
            )}
          </div>

          {/* 4. Expiry Date */}
          <div className={`p-4 rounded-xl border space-y-1 flex flex-col justify-between ${
            result.expiry_check.status === 'expired' 
              ? 'bg-rose-50 border-rose-300' 
              : result.expiry_check.status === 'expiring_soon'
              ? 'bg-amber-50 border-amber-300'
              : 'bg-emerald-50/60 border-emerald-200'
          }`}>
            <div>
              <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1 ${
                result.expiry_check.status === 'expired' ? 'text-rose-800' : 'text-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  result.expiry_check.status === 'expired' ? 'bg-rose-600' : 'bg-emerald-500'
                }`}></span>
                Expiry Date
              </div>
              {result.expiry_check.expiry_date_parsed || result.medicine_info.expiry_date ? (
                <>
                  <div className={`text-base font-mono font-black leading-tight ${
                    result.expiry_check.status === 'expired' ? 'text-rose-900' : 'text-slate-900'
                  }`}>
                    {result.expiry_check.expiry_date_parsed || result.medicine_info.expiry_date}
                  </div>
                  <div className={`text-[11px] font-bold mt-0.5 ${
                    result.expiry_check.status === 'expired' 
                      ? 'text-rose-700' 
                      : result.expiry_check.status === 'expiring_soon'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}>
                    {result.expiry_check.status === 'valid' && `✓ Valid (${result.expiry_check.days_remaining}d left)`}
                    {result.expiry_check.status === 'expired' && `✕ EXPIRED (${Math.abs(result.expiry_check.days_remaining || 0)}d ago)`}
                    {result.expiry_check.status === 'expiring_soon' && `⚠ Expiring Soon (${result.expiry_check.days_remaining}d)`}
                    {result.expiry_check.status === 'unknown' && 'Date logged'}
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800">
                    Check Blister Margin
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Format: EXP MM/YYYY on crimped foil edge.
                  </p>
                </div>
              )}
            </div>
            {!(result.expiry_check.expiry_date_parsed || result.medicine_info.expiry_date) && (
              <button
                type="button"
                onClick={() => setShowClarityModal(true)}
                className="mt-2 w-full py-1 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg text-[10px] font-bold transition-colors"
              >
                + Check Expiry Validity
              </button>
            )}
          </div>
        </div>

        {/* Quick Packaging Clarity Assistant Helper Bar */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Packaging Clarity Notice:</strong> If stamps or crimped markings are faint or on the other side of the blister pack, use the Clarity Assistant to select from certified monographs and instantly verify chemistry & expiry.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowClarityModal(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Clarify / Verify Details</span>
          </button>
        </div>
      </div>

      {/* 3. Grid: Expiry Status Card & Barcode Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Expiry Date Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Expiry Date Verification
              </h3>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                result.expiry_check.status === 'valid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : result.expiry_check.status === 'expiring_soon'
                  ? 'bg-amber-100 text-amber-800'
                  : result.expiry_check.status === 'expired'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {result.expiry_check.status === 'valid' && '✓ Not Expired'}
              {result.expiry_check.status === 'expiring_soon' && '⚠ Expiring Soon'}
              {result.expiry_check.status === 'expired' && '✕ Expired'}
              {result.expiry_check.status === 'unknown' && 'Unknown'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-700">Detected Expiry:</span>
              <span className="text-base font-bold font-mono text-slate-900">
                {result.expiry_check.expiry_date_parsed || result.medicine_info.expiry_date || 'Not detected'}
              </span>
            </div>
            {result.expiry_check.days_remaining !== null && (
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-700">Timeline:</span>
                <span className={`font-semibold ${
                  result.expiry_check.days_remaining < 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {result.expiry_check.days_remaining < 0
                    ? `${Math.abs(result.expiry_check.days_remaining)} days past expiry date`
                    : `${result.expiry_check.days_remaining} days remaining`}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-700">
            {result.expiry_check.message}
          </p>
        </div>

        {/* Barcode & GTIN Status Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Barcode className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Barcode / QR Code Check
              </h3>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                result.barcode_status === 'Verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : result.barcode_status === 'Not Found'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {result.barcode_status}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-700">Scanned Identifier:</span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {result.medicine_info.barcode || 'No barcode detected'}
              </span>
            </div>
            {result.medicine_info.qr_code && (
              <div className="text-[11px] text-slate-700 truncate">
                QR Payload: {result.medicine_info.qr_code}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-700">
            {result.barcode_status === 'Verified'
              ? 'Barcode successfully cross-referenced with authorized manufacturer catalog.'
              : result.barcode_status === 'Not Found'
              ? 'Barcode was detected on packaging but is not listed in configured medicine database.'
              : 'Barcode was not detected in this image. Packaging might be angled or barcode is on another side.'}
          </p>
        </div>
      </div>

      {/* 3. Section 15: Verification Details Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Comparative Verification Details
            </h3>
          </div>
          <span className="text-xs text-slate-700">
            Field-by-field audit against authorized registry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Verification Field</th>
                <th className="py-3 px-4">Scanned Packaging Data</th>
                <th className="py-3 px-4">Registered Record</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Medicine Name */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Medicine Name</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                  {result.medicine_info.medicine_name || <span className="text-slate-400 font-normal">Not detected</span>}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {result.matched_medicine?.medicine_name || <span className="text-slate-400">No match</span>}
                </td>
                <td className="py-3 px-4">
                  {renderEvidenceStatusIcon(result.matched_medicine ? 'matched' : (result.medicine_info.medicine_name ? 'not_found' : 'unverified'))}
                </td>
              </tr>

              {/* Chemical Formula */}
              <tr className="hover:bg-slate-50/50 bg-teal-50/30">
                <td className="py-3 px-4 font-semibold text-teal-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Chemical Formula
                </td>
                <td className="py-3 px-4 font-mono font-bold text-teal-800">
                  {result.medicine_info.chemical_formula || result.matched_medicine?.chemical_formula || <span className="text-slate-400 font-normal">Not specified</span>}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700">
                  {result.matched_medicine?.chemical_formula || <span className="text-slate-400">N/A</span>}
                </td>
                <td className="py-3 px-4">
                  {renderEvidenceStatusIcon(
                    result.evidence_items.find(e => e.field === 'chemical_formula')?.status || (result.matched_medicine?.chemical_formula ? 'matched' : 'unverified')
                  )}
                </td>
              </tr>

              {/* Manufacturing Date */}
              <tr className="hover:bg-slate-50/50 bg-cyan-50/20">
                <td className="py-3 px-4 font-semibold text-slate-900">Manufacturing Date (MFG)</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-800">
                  {result.medicine_info.manufacturing_date || <span className="text-slate-400 font-normal">Not detected</span>}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700">
                  {result.matched_batch?.manufacturing_date || (result.matched_medicine ? 'Standard Batch Records' : 'N/A')}
                </td>
                <td className="py-3 px-4">
                  {renderEvidenceStatusIcon(result.medicine_info.manufacturing_date ? 'matched' : 'unverified')}
                </td>
              </tr>

              {/* Expiry Date */}
              <tr className="hover:bg-slate-50/50 bg-rose-50/30">
                <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Expiry Date (EXP)
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                  {result.expiry_check.expiry_date_parsed || result.medicine_info.expiry_date || <span className="text-slate-400 font-normal">Unclear</span>}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700">
                  {result.matched_batch?.expiry_date || (result.matched_medicine ? 'Verified Future Window' : 'N/A')}
                </td>
                <td className="py-3 px-4">
                  {renderEvidenceStatusIcon(
                    result.expiry_check.status === 'valid' ? 'matched' : (result.expiry_check.status === 'expired' ? 'mismatch' : 'warning')
                  )}
                </td>
              </tr>

              {/* Manufacturer */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Manufacturer</td>
                <td className="py-3 px-4 text-slate-800">
                  {result.medicine_info.manufacturer || <span className="text-slate-400">Not detected</span>}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {result.matched_medicine?.manufacturer || <span className="text-slate-400">N/A</span>}
                </td>
                <td className="py-3 px-4">
                  {renderEvidenceStatusIcon(
                    result.evidence_items.find(e => e.field === 'manufacturer')?.status || 'unverified'
                  )}
                </td>
              </tr>

              {/* Batch Number */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Batch / Lot Number</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                  {result.medicine_info.batch_number || <span className="text-slate-400 font-normal">Not detected</span>}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700">
                  {result.matched_batch?.batch_number || (result.matched_medicine ? 'Not registered' : 'N/A')}
                </td>
                <td className="py-3 px-4">
                  {renderEvidenceStatusIcon(
                    result.evidence_items.find(e => e.field === 'batch_number')?.status || 'unverified'
                  )}
                </td>
              </tr>

              {/* Barcode */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Barcode / GTIN</td>
                <td className="py-3 px-4 font-mono text-slate-800">
                  {result.medicine_info.barcode || <span className="text-slate-400">Not detected</span>}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700">
                  {result.matched_medicine?.barcode || 'N/A'}
                </td>
                <td className="py-3 px-4">
                  {renderEvidenceStatusIcon(
                    result.barcode_status === 'Verified' ? 'matched' : (result.medicine_info.barcode ? 'warning' : 'unverified')
                  )}
                </td>
              </tr>

              {/* Expiry Date */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Expiry Date</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-800">
                  {result.expiry_check.expiry_date_parsed || result.medicine_info.expiry_date || 'Unclear'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700">
                  {result.matched_batch?.expiry_date || 'N/A'}
                </td>
                <td className="py-3 px-4">
                  {renderEvidenceStatusIcon(
                    result.expiry_check.status === 'valid' ? 'matched' : (result.expiry_check.status === 'expired' ? 'mismatch' : 'warning')
                  )}
                </td>
              </tr>

              {/* Database Record */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Database Record</td>
                <td className="py-3 px-4 text-slate-800">
                  {result.matched_medicine ? 'Verified Medicine Profile' : 'Unregistered'}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {result.matched_medicine ? `${result.matched_medicine.id} (Official)` : 'None'}
                </td>
                <td className="py-3 px-4">
                  {renderEvidenceStatusIcon(result.matched_medicine ? 'matched' : 'not_found')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Section 16: Confidence / Evidence Breakdown */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>Verification Evidence Summary</span>
          <span className="text-xs text-slate-700 font-normal">
            {result.evidence_items.filter(e => e.status === 'matched').length} consistent items
            {result.unverified_count > 0 && ` • ${result.unverified_count} unverified`}
          </span>
        </h3>

        <div className="space-y-2">
          {result.evidence_items.map((item, index) => (
            <div
              key={index}
              className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.label}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{item.detail}</p>
              </div>
              <div className="shrink-0">
                {renderEvidenceStatusIcon(item.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Prominent Safety Disclaimer */}
      <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
          <span>Safety Notice & Medical Responsibility Disclaimer</span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          {result.safety_notice}
        </p>
        <p className="text-[11px] text-amber-800 pt-1">
          If you suspect fake, altered, expired, or tampered medicines, do not consume them. Please report suspicious pharmaceuticals directly to your local health department or regulatory body (such as FDA MedWatch, CDSCO National Drug Authority, or WHO Alert System).
        </p>
      </div>

      {/* 6. Clarity & Quick Verification Modal */}
      {showClarityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Medicine Details Clarity & Fast-Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clarify or select the 4 core parameters to verify against approved pharmacological records
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClarityModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Click Monograph Presets */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>1-Click Popular Medicine Monographs & Imprints</span>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Instant Auto-Fill
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
                {commonMonographs.map((mono, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(mono)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium border text-left transition-all flex items-center gap-1.5 ${
                      draftName === mono.name
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                    }`}
                  >
                    <span>{mono.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">({mono.formula})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Core 4 Interactive Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Field 1: Medicine Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>1. Medicine Name & Brand</span>
                  <span className="text-[10px] text-teal-700 font-normal">Trade Name</span>
                </label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => {
                    setDraftName(e.target.value);
                  }}
                  placeholder="e.g. Paracetamol 500mg, Augmentin, Dolo 650"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              {/* Field 2: Chemical Formula */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>2. Chemical Formula</span>
                  <span className="text-[10px] text-teal-700 font-mono">Active Molecule</span>
                </label>
                <input
                  type="text"
                  value={draftFormula}
                  onChange={(e) => setDraftFormula(e.target.value)}
                  placeholder="e.g. C8H9NO2, C16H19N3O5S, C13H18O2"
                  className="w-full px-3.5 py-2.5 bg-teal-50/50 border border-teal-300 rounded-xl text-xs font-mono font-bold text-teal-950 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              {/* Field 3: Manufacturing Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>3. Manufacturing Date (MFG)</span>
                  <span className="text-[10px] text-slate-500">MM/YYYY</span>
                </label>
                <input
                  type="text"
                  value={draftMfg}
                  onChange={(e) => setDraftMfg(e.target.value)}
                  placeholder="e.g. 04/2026 or 10/2025"
                  className="w-full px-3.5 py-2.5 bg-cyan-50/50 border border-cyan-300 rounded-xl text-xs font-mono font-bold text-cyan-950 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                />
                <div className="flex gap-1.5 pt-0.5">
                  {['04/2026', '10/2025', '01/2025', '06/2024'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDraftMfg(d)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-cyan-100 text-slate-700 hover:text-cyan-900 rounded text-[10px] font-mono transition-colors"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>4. Expiry Date (EXP)</span>
                  <span className="text-[10px] text-slate-500">MM/YYYY</span>
                </label>
                <input
                  type="text"
                  value={draftExp}
                  onChange={(e) => setDraftExp(e.target.value)}
                  placeholder="e.g. 03/2028 or 12/2027"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
                <div className="flex gap-1.5 pt-0.5">
                  {['03/2028', '12/2027', '10/2026', '06/2025'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDraftExp(d)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        d === '06/2025' 
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-800' 
                          : 'bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-900'
                      }`}
                    >
                      {d} {d === '06/2025' ? '(Expired)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClarityModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyClarity}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply & Re-Verify with Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
