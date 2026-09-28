import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Calendar, 
  Tag, 
  Download, 
  X,
  FileText
} from 'lucide-react';
import { ScanHistoryRecord, VerificationStatusType } from '../types';

interface ScanHistoryViewProps {
  scans: ScanHistoryRecord[];
  onDeleteScan: (id: string) => void;
  onClearAll: () => void;
  onScanAnother: () => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  scans,
  onDeleteScan,
  onClearAll,
  onScanAnother
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedScan, setSelectedScan] = useState<ScanHistoryRecord | null>(null);

  const getStatusBadge = (status: VerificationStatusType) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Expired</span>
          </span>
        );
      case 'MISMATCH_DETECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Mismatch</span>
          </span>
        );
      case 'NOT_FOUND':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Not Found</span>
          </span>
        );
      case 'INSUFFICIENT_DATA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Insufficient Data</span>
          </span>
        );
      case 'UNABLE_TO_VERIFY':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Unable to Verify</span>
          </span>
        );
    }
  };

  const filteredScans = scans.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      s.medicine_name.toLowerCase().includes(q) ||
      s.batch_number.toLowerCase().includes(q) ||
      s.verification_reason.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || s.verification_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mediverify-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <History className="w-5 h-5" />
            </span>
            <span>Verification Scan History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review previous packaging scans, audit results, and detected expiration dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {scans.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data</span>
              </button>

              <button
                type="button"
                onClick={onClearAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onScanAnother}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            <span>Scan Medicine</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by medicine name, batch number, or audit summary..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'VERIFIED', 'EXPIRED', 'MISMATCH_DETECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Scans' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Scans List */}
      {filteredScans.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No scan history records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {scans.length === 0
              ? 'No medicines have been scanned yet. Upload an image or select a demo sample to begin.'
              : 'No scans match your current search or status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan) => {
            const formattedDate = new Date(scan.scan_timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={scan.id}
                className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">
                      {scan.medicine_name}
                    </h3>
                    {getStatusBadge(scan.verification_status)}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      Batch: {scan.batch_number}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Expires: {scan.expiry_date}
                    </span>
                    <span className="text-slate-400">
                      Scanned: {formattedDate}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 pt-0.5">
                    {scan.verification_reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {scan.full_result && (
                    <button
                      type="button"
                      onClick={() => setSelectedScan(scan)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteScan(scan.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Delete scan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedScan && selectedScan.full_result && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Verification Report Archive
                </span>
                {getStatusBadge(selectedScan.verification_status)}
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p><strong>Medicine:</strong> {selectedScan.medicine_name}</p>
                <p><strong>Batch:</strong> {selectedScan.batch_number}</p>
                <p><strong>Expiry:</strong> {selectedScan.expiry_date}</p>
                <p><strong>Audit Reason:</strong> {selectedScan.verification_reason}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Evidence Checklist:</h4>
                <div className="space-y-1.5">
                  {selectedScan.full_result.evidence_items.map((ev, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{ev.label}</p>
                        <p className="text-[11px] text-slate-600">{ev.detail}</p>
                      </div>
                      <span className="text-[11px] font-bold uppercase text-slate-500">
                        {ev.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
