import React from 'react';
import { 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  PhoneCall, 
  FileCheck2, 
  Eye, 
  PackageCheck
} from 'lucide-react';

export const HelpAndSafetyGuide: React.FC = () => {
  const faqs = [
    {
      q: 'Does MediVerify AI guarantee that a medicine is 100% genuine?',
      a: 'No. MediVerify AI is strictly an informational and assistance tool. It performs optical character recognition (OCR) and compares the printed details (brand name, batch number, manufacturer, and expiry date) against available database registries. It cannot test chemical purity, molecular composition, or storage conditions (e.g., cold-chain integrity). Always consult a licensed pharmacist or physician.'
    },
    {
      q: 'What should I do if the system detects an "EXPIRED" date?',
      a: 'Do not consume or administer expired medicines. Over time, active chemical compounds degrade, leading to decreased effectiveness or potentially toxic breakdown products. Return expired medicines to your pharmacy\'s disposal drop-off box or follow local pharmaceutical disposal guidelines.'
    },
    {
      q: 'What should I do if a "MISMATCH DETECTED" alert appears?',
      a: 'A mismatch means the printed batch number belongs to a different drug in regulatory registries, is flagged under a safety recall, or does not match the licensed manufacturer. Immediately stop using the medication, preserve the packaging, and consult your dispensing pharmacy or local drug authority.'
    },
    {
      q: 'Why does the app say "Record Not Found"?',
      a: 'If a medicine is manufactured by a regional company, newly released, imported, or not yet indexed in our verified database, it will be labeled "Record Not Found". This does not automatically prove it is counterfeit, but secondary verification with a healthcare professional is strongly recommended.'
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span className="p-2 bg-teal-50 text-teal-700 rounded-xl">
            <HelpCircle className="w-5 h-5" />
          </span>
          <span>Safety Guidelines & Verification Handbook</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Essential protocols for evaluating medicine authenticity, physical packaging inspection, and reporting suspicious drugs.
        </p>
      </div>

      {/* Physical Inspection Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
            <Eye className="w-5 h-5" />
          </span>
          <h3 className="text-base font-bold text-slate-900">
            Physical Packaging Inspection Checklist
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Before taking any medication, complement digital verification with these 5 physical checks:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <PackageCheck className="w-4 h-4 text-teal-600" />
              <span>1. Tamper-Evident Seals</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Verify that bottle seals, carton tape, or blister pouches show no signs of tearing, resealing, or glue discoloration.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileCheck2 className="w-4 h-4 text-teal-600" />
              <span>2. Print & Typography Quality</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Check for misspelled brand or chemical names, uneven font sizes, blurry printing, or text that smears easily when handled.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>3. Embossed Dates & Batch Numbers</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Authorized pharmaceuticals print batch numbers with dedicated matrix inkjets or mechanical embossing, never generic paper stickers.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>4. Tablet & Liquid Uniformity</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tablets should be uniform in color, thickness, and score lines with no excessive chalky powder or chipped edges.
            </p>
          </div>
        </div>
      </div>

      {/* Official Regulatory Authority Contacts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
            <PhoneCall className="w-5 h-5" />
          </span>
          <h3 className="text-base font-bold text-slate-900">
            Reporting Suspected Counterfeits & Recalls
          </h3>
        </div>

        <p className="text-xs text-slate-600">
          If you have identified a counterfeit or mismatched drug product, report it directly to the authorized regulatory bodies:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-4 bg-slate-50 rounded-xl border space-y-2 text-xs">
            <p className="font-bold text-slate-900">United States — FDA MedWatch</p>
            <p className="text-slate-600">Toll-free hotline: 1-800-FDA-1088</p>
            <p className="text-slate-500 text-[11px]">Reporting portal for adverse events and fake drugs.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border space-y-2 text-xs">
            <p className="font-bold text-slate-900">India — CDSCO National Portal</p>
            <p className="text-slate-600">Central Drugs Standard Control</p>
            <p className="text-slate-500 text-[11px]">State licensing authorities & drug testing laboratories.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border space-y-2 text-xs">
            <p className="font-bold text-slate-900">Global — World Health Org (WHO)</p>
            <p className="text-slate-600">Rapid Alert System</p>
            <p className="text-slate-500 text-[11px]">Surveillance and Monitoring System for Substandard & Falsified Medical Products.</p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4 space-y-1.5 first:pt-0 last:pb-0">
              <h4 className="text-xs font-bold text-slate-900 flex items-start gap-2">
                <span className="text-teal-600 font-mono">Q.</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 pl-5 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
