import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Layers, 
  Calendar, 
  FileText, 
  Pill,
  Database
} from 'lucide-react';

interface ScanningViewProps {
  imagePreview: string;
  isAnalyzing: boolean;
  isVerifying: boolean;
  isUnknownMode?: boolean;
}

export const ScanningView: React.FC<ScanningViewProps> = ({
  imagePreview,
  isAnalyzing,
  isVerifying,
  isUnknownMode = false,
}) => {
  const [stepIndex, setStepIndex] = useState<number>(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStepIndex(1), 600);
    const timer2 = setTimeout(() => setStepIndex(2), 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const steps = isUnknownMode
    ? [
        {
          title: 'High-Care Visual & Physical Inspection',
          desc: 'Analyzing tablet shape, color, beveling, and debossed imprint codes',
          icon: Pill,
          done: stepIndex >= 1 || !isAnalyzing,
          active: stepIndex === 0 && isAnalyzing
        },
        {
          title: 'Chemical & Molecular Identification',
          desc: 'Deriving active generic compound, chemical formula, and micro-dates',
          icon: Layers,
          done: stepIndex >= 2 || isVerifying,
          active: stepIndex === 1 || (isAnalyzing && stepIndex >= 1)
        },
        {
          title: 'Safety Screening & Tamper Anomaly Check',
          desc: 'Cross-referencing licensed monographs and assessing clinical risk level',
          icon: Database,
          done: !isAnalyzing && !isVerifying,
          active: isVerifying || stepIndex >= 2
        }
      ]
    : [
        {
          title: 'Scanning Medicine Packaging Image',
          desc: 'Optical character recognition (OCR) and visual packaging inspection',
          icon: Pill,
          done: stepIndex >= 1 || !isAnalyzing,
          active: stepIndex === 0 && isAnalyzing
        },
        {
          title: 'Extracting Core Medicine Details',
          desc: 'Medicine Name, Chemical Formula, Manufacturing Date, and Expiry Date',
          icon: Layers,
          done: stepIndex >= 2 || isVerifying,
          active: stepIndex === 1 || (isAnalyzing && stepIndex >= 1)
        },
        {
          title: 'Checking with Trusted Database',
          desc: 'Comparing batch registry, authorized manufacturer, and expiry status',
          icon: Database,
          done: !isAnalyzing && !isVerifying,
          active: isVerifying || stepIndex >= 2
        }
      ];

  return (
    <div className={`bg-white border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl mx-auto ${
      isUnknownMode ? 'border-amber-300 ring-2 ring-amber-100' : 'border-teal-200/80'
    }`}>
      {/* Header status */}
      <div className="text-center space-y-1.5">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
          isUnknownMode 
            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
            : 'bg-teal-50 border border-teal-200 text-teal-800'
        }`}>
          <Loader2 className={`w-3.5 h-3.5 animate-spin ${isUnknownMode ? 'text-amber-700' : 'text-teal-600'}`} />
          <span>{isUnknownMode ? 'High-Care Unknown Medicine Protocol' : 'Processing Medicine Packaging'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {isUnknownMode ? 'Inspecting Unknown Medicine with Deep Care...' : 'Scanning & Verifying with Database...'}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {isUnknownMode 
            ? 'Identifying debossed imprints, active chemical structure, micro-dates, and screening for physical contamination.'
            : 'Extracting medicine name, chemical formula, manufacturing date, and expiry date to check against trusted records.'}
        </p>
      </div>

      {/* Packaging Image with Active Laser Beam Animation */}
      <div className={`relative mx-auto max-w-sm rounded-xl overflow-hidden border-2 bg-slate-950 aspect-video flex items-center justify-center shadow-inner group ${
        isUnknownMode ? 'border-amber-500/50' : 'border-teal-500/40'
      }`}>
        <img
          src={imagePreview}
          alt="Medicine packaging under scan"
          className="w-full h-full object-contain opacity-90"
        />

        {/* Laser scanner line effect */}
        <div className={`absolute inset-x-0 h-1 bg-gradient-to-r from-transparent ${
          isUnknownMode ? 'via-amber-400 shadow-[0_0_15px_#f59e0b]' : 'via-cyan-400 shadow-[0_0_15px_#22d3ee]'
        } to-transparent animate-pulse top-0 bottom-0 m-auto animate-bounce pointer-events-none`} />

        {/* Scan overlay grid & corners */}
        <div className={`absolute inset-0 pointer-events-none border ${isUnknownMode ? 'border-amber-400/20' : 'border-cyan-400/20'}`} />
        <div className={`absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 ${isUnknownMode ? 'border-amber-400' : 'border-cyan-400'}`} />
        <div className={`absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 ${isUnknownMode ? 'border-amber-400' : 'border-cyan-400'}`} />
        <div className={`absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 ${isUnknownMode ? 'border-amber-400' : 'border-cyan-400'}`} />
        <div className={`absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 ${isUnknownMode ? 'border-amber-400' : 'border-cyan-400'}`} />

        {/* Live scanning pill */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isUnknownMode ? 'bg-amber-400' : 'bg-cyan-400'} animate-ping`} />
          <span className={isUnknownMode ? 'text-amber-300' : 'text-cyan-300'}>
            {isUnknownMode ? 'DEEP-CARE PROTOCOL ACTIVE' : 'AI OCR SCANNER ACTIVE'}
          </span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="space-y-3 pt-2">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                step.done
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                  : step.active
                  ? 'bg-teal-50/80 border-teal-300 text-slate-900 ring-2 ring-teal-200/50'
                  : 'bg-slate-50 border-slate-200/60 text-slate-500 opacity-60'
              }`}
            >
              <div className="mt-0.5">
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : step.active ? (
                  <Loader2 className="w-5 h-5 text-teal-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <StepIcon className="w-3.5 h-3.5 text-slate-600" />
                  <span>{step.title}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
