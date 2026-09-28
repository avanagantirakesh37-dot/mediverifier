import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface SafetyNoticeBannerProps {
  compact?: boolean;
  className?: string;
}

export const SafetyNoticeBanner: React.FC<SafetyNoticeBannerProps> = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-amber-50/90 border border-amber-200/80 rounded-lg text-xs text-amber-900 ${className}`}>
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Assistance Tool Only:</strong> AI verification does not guarantee authenticity or replace a licensed pharmacist or physician.
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/90 rounded-xl shadow-xs ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-900 tracking-tight">
            Important Pharmaceutical Safety Notice
          </h4>
          <p className="text-xs leading-relaxed text-amber-800">
            MediVerify AI is an educational and supportive verification aid. It checks scanned package text, batch identifiers, and barcodes against available trusted databases. It <strong>never guarantees 100% authenticity or chemical composition</strong>. If you suspect tampering, expired medication, or adverse reactions, immediately consult a licensed pharmacist, authorized healthcare provider, or your national drug regulatory agency.
          </p>
        </div>
      </div>
    </div>
  );
};
