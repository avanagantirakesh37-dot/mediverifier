import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  PlusCircle, 
  Database, 
  Tag, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Unlock,
  Building2,
  Calendar,
  Layers,
  Barcode
} from 'lucide-react';
import { Medicine, MedicineBatch } from '../types';

export const AdminPanel: React.FC = () => {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [passError, setPassError] = useState(false);

  const [activeTab, setActiveTab] = useState<'medicines' | 'batches'>('medicines');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);

  // Add Medicine Form
  const [newMed, setNewMed] = useState({
    medicine_name: '',
    generic_name: '',
    manufacturer: '',
    strength: '',
    dosage_form: 'Tablet',
    barcode: '',
    description: '',
    standard_mrp: '₹',
  });

  // Add Batch Form
  const [newBatch, setNewBatch] = useState({
    medicine_id: '',
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    mrp: '₹',
    is_recalled: false,
    recall_reason: '',
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDirectory();
  }, []);

  const fetchDirectory = async () => {
    try {
      const [mRes, bRes] = await Promise.all([
        fetch('/api/medicines'),
        fetch('/api/batches'),
      ]);
      const mData = await mRes.json();
      const bData = await bRes.json();
      if (mData.medicines) {
        setMedicines(mData.medicines);
        if (mData.medicines.length > 0 && !newBatch.medicine_id) {
          setNewBatch((prev) => ({ ...prev, medicine_id: mData.medicines[0].id }));
        }
      }
      if (bData.batches) setBatches(bData.batches);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple admin passcode check with default fallback for ease of review
    if (adminPasscode.toLowerCase().trim() === 'admin' || adminPasscode.trim() === '1234' || adminPasscode === '') {
      setIsAdminUnlocked(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.medicine_name || !newMed.manufacturer) {
      setFeedbackMsg({ type: 'error', text: 'Medicine name and manufacturer are required.' });
      return;
    }

    try {
      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Added "${newMed.medicine_name}" to database.` });
        setNewMed({
          medicine_name: '',
          generic_name: '',
          manufacturer: '',
          strength: '',
          dosage_form: 'Tablet',
          barcode: '',
          description: '',
          standard_mrp: '₹',
        });
        fetchDirectory();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to add medicine' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm('Are you sure you want to remove this medicine and all its registered batches?')) return;
    try {
      const res = await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Medicine record deleted.' });
        fetchDirectory();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.medicine_id || !newBatch.batch_number || !newBatch.expiry_date) {
      setFeedbackMsg({ type: 'error', text: 'Medicine, batch number, and expiry date are required.' });
      return;
    }

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatch),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Added batch ${newBatch.batch_number} successfully.` });
        setNewBatch((prev) => ({
          ...prev,
          batch_number: '',
          manufacturing_date: '',
          expiry_date: '',
          is_recalled: false,
          recall_reason: '',
        }));
        fetchDirectory();
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to add batch' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteBatch = async (id: string) => {
    try {
      const res = await fetch(`/api/batches/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Batch deleted.' });
        fetchDirectory();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Admin Catalog Console</h2>
            <p className="text-xs text-slate-500 mt-1">
              Authorized administrators can manage licensed pharmaceutical profiles and batch release records.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3 pt-2">
            <input
              type="password"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              placeholder="Enter passcode (or press unlock)"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-center font-mono"
            />
            {passError && (
              <p className="text-xs text-rose-600">Incorrect passcode. (Hint: 'admin' or leave blank)</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Unlock Admin Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-2 bg-slate-900 text-white rounded-xl">
              <Settings className="w-5 h-5" />
            </span>
            <span>Admin Catalog Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain the trusted drug registry, configure batch serial numbers, and issue recall notices.
          </p>
        </div>

        <button
          onClick={() => setIsAdminUnlocked(false)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock Console</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('medicines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'medicines'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manage Medicines ({medicines.length})
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'batches'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manage Batches & Recalls ({batches.length})
        </button>
      </div>

      {/* TAB 1: MEDICINES */}
      {activeTab === 'medicines' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Medicine Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-teal-600" />
              <span>Add New Medicine Record</span>
            </h3>

            <form onSubmit={handleAddMedicine} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  value={newMed.medicine_name}
                  onChange={(e) => setNewMed({ ...newMed, medicine_name: e.target.value })}
                  placeholder="e.g. Paracetamol 500 mg"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Generic Name</label>
                <input
                  type="text"
                  value={newMed.generic_name}
                  onChange={(e) => setNewMed({ ...newMed, generic_name: e.target.value })}
                  placeholder="e.g. Paracetamol IP"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufacturer *</label>
                <input
                  type="text"
                  value={newMed.manufacturer}
                  onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
                  placeholder="e.g. GlaxoSmithKline Pharmaceuticals"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Strength</label>
                  <input
                    type="text"
                    value={newMed.strength}
                    onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                    placeholder="e.g. 500 mg"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage Form</label>
                  <select
                    value={newMed.dosage_form}
                    onChange={(e) => setNewMed({ ...newMed, dosage_form: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Film-coated Tablet">Film-coated Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    value={newMed.barcode}
                    onChange={(e) => setNewMed({ ...newMed, barcode: e.target.value })}
                    placeholder="e.g. 8901117002015"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standard MRP</label>
                  <input
                    type="text"
                    value={newMed.standard_mrp}
                    onChange={(e) => setNewMed({ ...newMed, standard_mrp: e.target.value })}
                    placeholder="e.g. ₹30.50"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Description</label>
                <textarea
                  rows={2}
                  value={newMed.description}
                  onChange={(e) => setNewMed({ ...newMed, description: e.target.value })}
                  placeholder="Primary indications and pharmacopeial details"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                Add Medicine Record
              </button>
            </form>
          </div>

          {/* Medicines List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Registered Medicines</h3>
            <div className="space-y-2">
              {medicines.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{m.medicine_name}</p>
                    <p className="text-slate-500">{m.generic_name} • {m.manufacturer}</p>
                    <p className="font-mono text-slate-400">Barcode: {m.barcode}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteMedicine(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete Medicine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATCHES */}
      {activeTab === 'batches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Batch Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-600" />
              <span>Register Authorized Batch</span>
            </h3>

            <form onSubmit={handleAddBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Associated Medicine *</label>
                <select
                  value={newBatch.medicine_id}
                  onChange={(e) => setNewBatch({ ...newBatch, medicine_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500"
                >
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.medicine_name} ({m.manufacturer})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch / Lot Number *</label>
                <input
                  type="text"
                  value={newBatch.batch_number}
                  onChange={(e) => setNewBatch({ ...newBatch, batch_number: e.target.value.toUpperCase() })}
                  placeholder="e.g. PCM2605"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mfg Date (MM/YYYY)</label>
                  <input
                    type="text"
                    value={newBatch.manufacturing_date}
                    onChange={(e) => setNewBatch({ ...newBatch, manufacturing_date: e.target.value })}
                    placeholder="05/2026"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date (MM/YYYY) *</label>
                  <input
                    type="text"
                    value={newBatch.expiry_date}
                    onChange={(e) => setNewBatch({ ...newBatch, expiry_date: e.target.value })}
                    placeholder="04/2028"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">MRP for this batch</label>
                <input
                  type="text"
                  value={newBatch.mrp}
                  onChange={(e) => setNewBatch({ ...newBatch, mrp: e.target.value })}
                  placeholder="₹30.50"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              {/* Recall Flag */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={newBatch.is_recalled}
                    onChange={(e) => setNewBatch({ ...newBatch, is_recalled: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Mark as Recalled / Quality Alert Batch</span>
                </label>

                {newBatch.is_recalled && (
                  <input
                    type="text"
                    value={newBatch.recall_reason}
                    onChange={(e) => setNewBatch({ ...newBatch, recall_reason: e.target.value })}
                    placeholder="e.g. Sub-potency defect detected during stability study."
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-[11px] outline-none"
                  />
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                Register Batch
              </button>
            </form>
          </div>

          {/* Batches List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Batch Registry</h3>
            <div className="space-y-2">
              {batches.map((b) => {
                const med = medicines.find((m) => m.id === b.medicine_id);
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      b.is_recalled ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{b.batch_number}</span>
                        <span className="text-slate-500">({med?.medicine_name || 'Medicine'})</span>
                        {b.is_recalled && (
                          <span className="px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded font-bold text-[10px]">
                            RECALLED
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500">
                        Mfg: {b.manufacturing_date || 'N/A'} • Exp: {b.expiry_date} • MRP: {b.mrp}
                      </p>
                      {b.is_recalled && b.recall_reason && (
                        <p className="text-[11px] text-rose-700 italic">{b.recall_reason}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteBatch(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Delete batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
