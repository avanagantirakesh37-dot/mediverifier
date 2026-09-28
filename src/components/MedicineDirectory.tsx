import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Database, 
  Building2, 
  Layers, 
  Barcode, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Tag,
  Calendar,
  Filter
} from 'lucide-react';
import { Medicine, MedicineBatch } from '../types';

export const MedicineDirectory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dosageFilter, setDosageFilter] = useState('All');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [medRes, batRes] = await Promise.all([
        fetch('/api/medicines'),
        fetch('/api/batches')
      ]);
      const medData = await medRes.json();
      const batData = await batRes.json();

      if (medData.medicines) setMedicines(medData.medicines);
      if (batData.batches) setBatches(batData.batches);
    } catch (err) {
      console.error('Error fetching medicine directory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      m.medicine_name.toLowerCase().includes(q) ||
      m.generic_name.toLowerCase().includes(q) ||
      m.manufacturer.toLowerCase().includes(q) ||
      m.barcode.includes(q) ||
      batches.some(b => b.medicine_id === m.id && b.batch_number.toLowerCase().includes(q));

    const matchesDosage = dosageFilter === 'All' || m.dosage_form.toLowerCase().includes(dosageFilter.toLowerCase());

    return matchesSearch && matchesDosage;
  });

  const getBatchesForMed = (medId: string) => {
    return batches.filter(b => b.medicine_id === medId);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Database className="w-5 h-5" />
            </span>
            <span>Trusted Medicine Database</span>
          </h2>
          <p className="text-xs text-slate-700 mt-1">
            Search verified pharmaceutical monographs, approved batches, GTIN barcodes, and regulatory recall alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-teal-50 border border-teal-200/80 rounded-lg text-teal-800 font-bold">
            {medicines.length} Approved Formulations
          </span>
          <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold">
            {batches.length} Registered Batches
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand name, generic drug, manufacturer, batch number, or barcode..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={dosageFilter}
            onChange={(e) => setDosageFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-teal-500"
          >
            <option value="All">All Dosage Forms</option>
            <option value="Tablet">Tablets</option>
            <option value="Capsule">Capsules</option>
            <option value="Inhaler">Inhalers</option>
            <option value="Syrup">Syrups</option>
          </select>
        </div>
      </div>

      {/* Medicine Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Loading trusted medicine directory...
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
          <Database className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching medicines found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find records matching "{searchQuery}". You can check spelling or add new medicine entries via the Admin Catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMedicines.map((med) => {
            const medBatches = getBatchesForMed(med.id);
            const hasRecalled = medBatches.some(b => b.is_recalled);

            return (
              <div
                key={med.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">
                          {med.medicine_name}
                        </h3>
                        {hasRecalled && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Recall Notice
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-teal-700 font-medium mt-0.5">
                        {med.generic_name}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shrink-0">
                      {med.dosage_form}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {med.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{med.manufacturer}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{med.strength || 'Standard'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{med.barcode}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <span>MRP: {med.standard_mrp || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Batches Sub-section */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Authorized Batches ({medBatches.length})</span>
                    <span className="text-slate-400 font-normal lowercase">mfg • exp</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {medBatches.slice(0, 4).map((b) => (
                      <span
                        key={b.id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-medium border ${
                          b.is_recalled
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{b.batch_number}</span>
                        <span className="text-[10px] text-slate-400">({b.expiry_date})</span>
                      </span>
                    ))}
                    {medBatches.length > 4 && (
                      <span className="px-2 py-1 bg-slate-100 rounded text-[11px] text-slate-600 font-semibold">
                        +{medBatches.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
