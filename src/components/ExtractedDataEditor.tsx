import React, { useState } from 'react';
import { 
  FileText, 
  Edit3, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Barcode, 
  Calendar, 
  Pill, 
  Building2, 
  Layers, 
  Tag
} from 'lucide-react';
import { ExtractedMedicineData } from '../types';

interface ExtractedDataEditorProps {
  data: ExtractedMedicineData;
  onVerify: (data: ExtractedMedicineData) => void;
  isVerifying?: boolean;
}

export const ExtractedDataEditor: React.FC<ExtractedDataEditorProps> = ({
  data,
  onVerify,
  isVerifying = false,
}) => {
  const [formData, setFormData] = useState<ExtractedMedicineData>(data);
  const [showRawOcr, setShowRawOcr] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof ExtractedMedicineData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(formData);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
              <Pill className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Extracted Medicine Packaging Information
            </h3>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            AI OCR identified the following fields from the packaging. You can edit any field before cross-checking with the database.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            isEditing
              ? 'bg-teal-50 border-teal-200 text-teal-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Editing Mode Active' : 'Edit Information'}</span>
        </button>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Medicine Name */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Medicine / Brand Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.medicine_name || ''}
                onChange={(e) => handleChange('medicine_name', e.target.value)}
                placeholder="e.g. Paracetamol 500 mg (Crocin)"
                className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Generic Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Generic / Chemical Name
            </label>
            <input
              type="text"
              value={formData.generic_name || ''}
              onChange={(e) => handleChange('generic_name', e.target.value)}
              placeholder="e.g. Paracetamol IP"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Chemical Formula */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Chemical Formula
            </label>
            <input
              type="text"
              value={formData.chemical_formula || ''}
              onChange={(e) => handleChange('chemical_formula', e.target.value)}
              placeholder="e.g. C8H9NO2"
              className="w-full px-3.5 py-2 text-xs font-mono font-bold text-teal-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Manufacturer */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Manufacturer / Marketing Authorization</span>
            </label>
            <input
              type="text"
              value={formData.manufacturer || ''}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              placeholder="e.g. GlaxoSmithKline Pharmaceuticals Ltd."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Batch / Lot Number */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-teal-600" />
              <span>Batch / Lot Number *</span>
            </label>
            <input
              type="text"
              value={formData.batch_number || ''}
              onChange={(e) => handleChange('batch_number', e.target.value.toUpperCase())}
              placeholder="e.g. PCM2604"
              className="w-full px-3.5 py-2 text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-slate-900"
            />
          </div>

          {/* Manufacturing Date */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Manufacturing Date (MFG)</span>
            </label>
            <input
              type="text"
              value={formData.manufacturing_date || ''}
              onChange={(e) => handleChange('manufacturing_date', e.target.value)}
              placeholder="MM/YYYY or DD/MM/YYYY"
              className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <span>Expiry Date (EXP) *</span>
            </label>
            <input
              type="text"
              value={formData.expiry_date || ''}
              onChange={(e) => handleChange('expiry_date', e.target.value)}
              placeholder="MM/YYYY or DD/MM/YYYY"
              className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-slate-900"
            />
          </div>

          {/* MRP */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              MRP (Maximum Retail Price)
            </label>
            <input
              type="text"
              value={formData.mrp || ''}
              onChange={(e) => handleChange('mrp', e.target.value)}
              placeholder="e.g. ₹30.50 or $12.00"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Strength */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Strength
            </label>
            <input
              type="text"
              value={formData.strength || ''}
              onChange={(e) => handleChange('strength', e.target.value)}
              placeholder="e.g. 500 mg, 625 mg"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Dosage Form */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Dosage Form</span>
            </label>
            <select
              value={formData.dosage_form || 'Tablet'}
              onChange={(e) => handleChange('dosage_form', e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="Tablet">Tablet</option>
              <option value="Film-coated Tablet">Film-coated Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup / Liquid">Syrup / Liquid</option>
              <option value="Suspension">Suspension</option>
              <option value="Inhaler / Aerosol">Inhaler / Aerosol</option>
              <option value="Injection / Vial">Injection / Vial</option>
              <option value="Ointment / Gel">Ointment / Gel</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Barcode */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Barcode className="w-3.5 h-3.5 text-slate-600" />
              <span>Barcode / GTIN / EAN-13</span>
            </label>
            <input
              type="text"
              value={formData.barcode || ''}
              onChange={(e) => handleChange('barcode', e.target.value)}
              placeholder="e.g. 8901117002015"
              className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Raw OCR Toggle */}
        {formData.raw_ocr_text && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowRawOcr(!showRawOcr)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showRawOcr ? 'Hide Raw OCR Text' : 'View Detected Packaging Raw Text'}</span>
              {showRawOcr ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showRawOcr && (
              <div className="mt-2 p-3 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {formData.raw_ocr_text}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-700">
            * Verification will cross-check the medicine, batch number, manufacturer, and expiry date against registered records.
          </p>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifying ? 'Verifying Against Database...' : 'Run Database Verification & Expiry Check'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
