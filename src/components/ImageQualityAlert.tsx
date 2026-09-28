import React from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, Eye, SunMedium, FileWarning, ShieldQuestion } from 'lucide-react';
import { ImageQualityAssessment } from '../types';

interface ImageQualityAlertProps {
  assessment: ImageQualityAssessment;
  onTryAgain: () => void;
  onProceedAnyway: () => void;
}

export const ImageQualityAlert: React.FC<ImageQualityAlertProps> = ({
  assessment,
  onTryAgain,
  onProceedAnyway
}) => {
  const isFailed = !assessment.is_readable || assessment.blur_detected || !assessment.text_visible || assessment.lighting_quality === 'poor';

  if (!isFailed) {
    return (
      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Image Quality Passed:</strong> Text and packaging labels appear clear and legible.
          </span>
        </div>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
          Good Lighting
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-amber-950">
            We couldn't clearly read the medicine information.
          </h3>
          <p className="text-xs text-amber-900 leading-relaxed">
            Please upload a clearer image. Blurry text, reflections, or poor lighting can cause errors when detecting batch numbers and expiry dates.
          </p>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
          assessment.blur_detected ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <FileWarning className={`w-4 h-4 ${assessment.blur_detected ? 'text-rose-600' : 'text-slate-400'}`} />
          <span>{assessment.blur_detected ? 'Blur Detected' : 'Sharp Image'}</span>
        </div>

        <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
          !assessment.text_visible ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <Eye className={`w-4 h-4 ${!assessment.text_visible ? 'text-rose-600' : 'text-slate-400'}`} />
          <span>{assessment.text_visible ? 'Text Legible' : 'Text Not Visible'}</span>
        </div>

        <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
          assessment.lighting_quality === 'poor' ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <SunMedium className={`w-4 h-4 ${assessment.lighting_quality === 'poor' ? 'text-amber-600' : 'text-slate-400'}`} />
          <span className="capitalize">{assessment.lighting_quality} Lighting</span>
        </div>

        <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
          !assessment.expiry_date_visible ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <ShieldQuestion className={`w-4 h-4 ${!assessment.expiry_date_visible ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>{assessment.expiry_date_visible ? 'Expiry Found' : 'Expiry Unclear'}</span>
        </div>
      </div>

      {assessment.notes && (
        <p className="text-[11px] text-amber-800/90 italic bg-amber-100/60 p-2 rounded-lg">
          Diagnostic Note: {assessment.notes}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onTryAgain}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again with Clearer Photo</span>
        </button>

        <button
          type="button"
          onClick={onProceedAnyway}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-amber-300 text-amber-950 font-semibold text-xs rounded-xl transition-colors"
        >
          Edit / Review Fields Manually
        </button>
      </div>
    </div>
  );
};
