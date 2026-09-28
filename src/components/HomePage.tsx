import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Barcode, 
  FileText, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Database,
  Pill,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { SafetyNoticeBanner } from './SafetyNoticeBanner';
import { DEMO_SAMPLES } from '../data/demoSamples';
import { DemoSample, ScanHistoryRecord, VerificationStatusType } from '../types';

interface HomePageProps {
  onScanMedicine: () => void;
  onUploadImage: () => void;
  onSelectDemo: (sample: DemoSample) => void;
  onViewHistory: () => void;
  onExploreDirectory: () => void;
  scans: ScanHistoryRecord[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onScanMedicine,
  onUploadImage,
  onSelectDemo,
  onViewHistory,
  onExploreDirectory,
  scans
}) => {
  const [stats, setStats] = useState({
    totalScans: 0,
    verifiedCount: 0,
    expiredCount: 0,
    mismatchCount: 0,
    totalMedicines: 8,
    totalBatches: 14
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats(data.stats);
        }
      })
      .catch((e) => console.error(e));
  }, [scans]);

  const getStatusBadge = (status: VerificationStatusType) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" />
            Expired
          </span>
        );
      case 'MISMATCH_DETECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3" />
            Mismatch
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
            {status.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 pb-8">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-teal-900 via-slate-900 to-slate-950 text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-teal-800/40">
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948812_1px,transparent_1px),linear-gradient(to_bottom,#0d948812_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/40 rounded-full text-xs font-semibold text-teal-300 backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>AI-Assisted Medicine Packaging & Expiry Verification</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Verify Your Medicine <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400">
              Before You Use It
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
            Use AI-assisted scanning to check medicine packaging details, detect expiration dates, cross-reference batch numbers against registered pharmaceutical databases, and identify packaging anomalies.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onScanMedicine}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-teal-500/25 transition-all transform active:scale-95"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Medicine Packaging</span>
            </button>

            <button
              type="button"
              onClick={onUploadImage}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm rounded-xl backdrop-blur-xs transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image File</span>
            </button>

            <button
              type="button"
              onClick={onExploreDirectory}
              className="flex items-center gap-2 px-4 py-3.5 text-xs text-teal-300 hover:text-teal-200 font-semibold"
            >
              <Database className="w-4 h-4" />
              <span>Search Database</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Prominent Safety Notice */}
      <SafetyNoticeBanner />

      {/* 3. Live Dashboard Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
            <span>Total Scans Logged</span>
            <History className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.totalScans}
          </div>
          <p className="text-[11px] text-slate-600">Verification analyses executed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <span>Consistent Records</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats.verifiedCount}
          </div>
          <p className="text-[11px] text-slate-600">Matches registered manufacturer batch</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-800 font-semibold">
            <span>Expired Detected</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {stats.expiredCount}
          </div>
          <p className="text-[11px] text-slate-600">Alerted users to expired drugs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
            <span>Mismatches & Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats.mismatchCount}
          </div>
          <p className="text-[11px] text-slate-600">Flagged rogue batches / recalls</p>
        </div>
      </section>

      {/* 4. Section 6 Feature Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            How MediVerify AI Protects Consumers
          </h2>
          <p className="text-xs text-slate-700">
            Multilayered verification pipeline connecting optical character recognition with authenticated pharmaceutical data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-teal-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI-Powered OCR Extraction</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Extracts 11 key fields verbatim from pharmaceutical packaging, including brand name, active ingredients, manufacturer, lot/batch numbers, and prices.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-teal-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Precision Expiry Date Detection</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Calculates days remaining against pharmaceutical standard month-end conventions, alerting to expired products or medications expiring within 90 days.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-teal-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Barcode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Barcode & QR Verification</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Decodes 1D barcodes (EAN-13, UPC) and 2D GS1 DataMatrix codes, cross-checking product identifiers with the authorized database registry.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-teal-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Trusted Batch Registry</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Cross-references batch identifiers against manufacturer release logs, immediately detecting rogue batch codes or recalled batches.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-teal-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Evidence-Based Results</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Rather than an arbitrary AI score, every result presents an itemized evidence checklist showing exactly which fields matched and which were missing.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-teal-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Scan Audit History</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Maintains an offline-capable archive of your previously verified medicine packaging with date stamps, audit findings, and export options.
            </p>
          </div>

        </div>
      </section>

      {/* 5. Demo Presets Quick-Test Section */}
      <section className="bg-gradient-to-br from-teal-50/70 via-slate-50 to-cyan-50/50 border border-teal-200/60 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-teal-800 tracking-wider">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Instant Test Scenarios</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Test Pre-Configured Demo Medicine Packages
            </h2>
            <p className="text-xs text-slate-700">
              No medicine box handy? Test real-life scenarios with one click to observe the full verification pipeline.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {DEMO_SAMPLES.slice(0, 3).map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectDemo(sample)}
              className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-teal-400 hover:shadow-md transition-all text-left flex flex-col justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                    {sample.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      sample.expectedStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sample.expectedStatus === 'EXPIRED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sample.expectedStatus.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">
                  {sample.subtitle}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
                <span>Simulate package verification</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 6. Section 24: Recent Scans Dashboard Table */}
      {scans.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              <span>Recent Scans</span>
            </h2>
            <button
              type="button"
              onClick={onViewHistory}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
            >
              <span>View All Scans ({scans.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Expiry</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Scanned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scans.slice(0, 4).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900">{s.medicine_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{s.batch_number}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{s.expiry_date}</td>
                    <td className="py-3 px-3">{getStatusBadge(s.verification_status)}</td>
                    <td className="py-3 px-3 text-slate-700">
                      {new Date(s.scan_timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
};
