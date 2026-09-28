/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar, NavTab } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { ImageUploader } from './components/ImageUploader';
import { ImageQualityAlert } from './components/ImageQualityAlert';
import { ExtractedDataEditor } from './components/ExtractedDataEditor';
import { VerificationResultCard } from './components/VerificationResultCard';
import { ScanningView } from './components/ScanningView';
import { MedicineDirectory } from './components/MedicineDirectory';
import { ScanHistoryView } from './components/ScanHistoryView';
import { AdminPanel } from './components/AdminPanel';
import { HelpAndSafetyGuide } from './components/HelpAndSafetyGuide';
import { SafetyNoticeBanner } from './components/SafetyNoticeBanner';
import { DEMO_SAMPLES } from './data/demoSamples';
import { 
  ExtractedMedicineData, 
  ImageQualityAssessment, 
  VerificationResult, 
  ScanHistoryRecord,
  DemoSample,
  UnknownMedicineAnalysis
} from './types';
import { 
  Scan, 
  Sparkles, 
  RotateCcw, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle,
  ArrowRight,
  Database,
  Edit3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [scans, setScans] = useState<ScanHistoryRecord[]>([]);

  // Scan state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/jpeg');
  const [isDemoScan, setIsDemoScan] = useState(false);
  const [isUnknownModeScan, setIsUnknownModeScan] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [qualityAssessment, setQualityAssessment] = useState<ImageQualityAssessment | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedMedicineData | null>(null);
  const [unknownAnalysis, setUnknownAnalysis] = useState<UnknownMedicineAnalysis | null>(null);
  const [isVerifyingMatch, setIsVerifyingMatch] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showAdjustFields, setShowAdjustFields] = useState<boolean>(false);

  // Load scans on start
  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const res = await fetch('/api/scans');
      const data = await res.json();
      if (data.scans) {
        setScans(data.scans);
      }
    } catch (e) {
      console.error('Error fetching scans:', e);
    }
  };

  const resetVerificationState = () => {
    setUploadedImage(null);
    setQualityAssessment(null);
    setExtractedData(null);
    setUnknownAnalysis(null);
    setVerificationResult(null);
    setScanError(null);
    setIsDemoScan(false);
    setIsUnknownModeScan(false);
    setShowAdjustFields(false);
    setIsAnalyzingImage(false);
    setIsVerifyingMatch(false);
  };

  const handleImageSelected = async (
    base64: string, 
    mimeType: string, 
    demoPreset?: DemoSample,
    isUnknownMedicine: boolean = false
  ) => {
    resetVerificationState();
    setUploadedImage(base64);
    setUploadedMimeType(mimeType);
    setIsUnknownModeScan(isUnknownMedicine);

    if (demoPreset) {
      setIsDemoScan(true);
      const isBlurry = demoPreset.expectedStatus === 'INSUFFICIENT_DATA';
      const assessment: ImageQualityAssessment = {
        is_readable: !isBlurry,
        blur_detected: isBlurry,
        text_visible: !isBlurry,
        lighting_quality: isBlurry ? 'poor' : 'good',
        packaging_visible: true,
        expiry_date_visible: !isBlurry,
        notes: demoPreset.notes
      };
      setQualityAssessment(assessment);
      setExtractedData({ ...demoPreset.medicineData });

      // Automatically run database verification
      handleRunVerification(demoPreset.medicineData, base64, true, null);
      return;
    }

    // Call server AI OCR with Gemini with retry and unknown mode
    setIsAnalyzingImage(true);
    setScanError(null);

    try {
      const res = await fetch('/api/verify/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mimeType || 'image/jpeg',
          isUnknownMedicine
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process packaging image.');
      }

      setQualityAssessment(data.qualityAssessment);
      setExtractedData(data.extractedData);
      if (data.unknownAnalysis) {
        setUnknownAnalysis(data.unknownAnalysis);
      }

      // Automatically trigger database verification to show result immediately
      await handleRunVerification(data.extractedData, base64, false, data.unknownAnalysis);
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'We could not process the packaging photo. Please try a clearer image.');
      // Create fallback structure
      const fallbackAssessment: ImageQualityAssessment = {
        is_readable: false,
        blur_detected: true,
        text_visible: false,
        lighting_quality: 'poor',
        packaging_visible: false,
        expiry_date_visible: false,
        notes: err.message
      };
      setQualityAssessment(fallbackAssessment);
      const fallbackData: ExtractedMedicineData = {
        medicine_name: null,
        generic_name: null,
        chemical_formula: null,
        manufacturer: null,
        batch_number: null,
        manufacturing_date: null,
        expiry_date: null,
        mrp: null,
        strength: null,
        dosage_form: 'Tablet',
        barcode: null,
        qr_code: null,
        raw_ocr_text: ''
      };
      setExtractedData(fallbackData);
      // Run match even on fallback to get clear status
      await handleRunVerification(fallbackData, base64, false, null);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleRunVerification = async (
    dataToVerify: ExtractedMedicineData, 
    imgUrlOverride?: string, 
    demoOverride?: boolean,
    unknownOverride?: UnknownMedicineAnalysis | null
  ) => {
    setIsVerifyingMatch(true);
    setScanError(null);

    const imgToUse = imgUrlOverride || uploadedImage;
    const isDemoToUse = demoOverride !== undefined ? demoOverride : isDemoScan;
    const analysisToUse = unknownOverride !== undefined ? unknownOverride : unknownAnalysis;

    try {
      const res = await fetch('/api/verify/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedData: dataToVerify,
          imageUrl: imgToUse,
          isDemo: isDemoToUse,
          unknownAnalysis: analysisToUse
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification match failed.');
      }

      setVerificationResult(data.result);
      fetchScans();

      // Confetti celebration if verified and valid
      if (data.result.status === 'VERIFIED') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      console.error('Verification match error:', err);
      setScanError(err.message || 'Verification service temporarily unavailable.');
    } finally {
      setIsVerifyingMatch(false);
    }
  };

  const handleDeleteScan = async (id: string) => {
    try {
      const res = await fetch(`/api/scans/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setScans((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting scan:', err);
    }
  };

  const handleClearAllScans = async () => {
    if (!confirm('Are you sure you want to clear your entire verification scan history?')) return;
    try {
      const res = await fetch('/api/scans/clear', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setScans([]);
      }
    } catch (err) {
      console.error('Error clearing scans:', err);
    }
  };

  const handleSelectDemoPreset = (sample: DemoSample) => {
    setCurrentTab('verify');
    handleImageSelected('', 'image/png', sample);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        scansCount={scans.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* 1. HOME TAB */}
        {currentTab === 'home' && (
          <HomePage
            onScanMedicine={() => {
              resetVerificationState();
              setCurrentTab('verify');
            }}
            onUploadImage={() => {
              resetVerificationState();
              setCurrentTab('verify');
            }}
            onSelectDemo={handleSelectDemoPreset}
            onViewHistory={() => setCurrentTab('history')}
            onExploreDirectory={() => setCurrentTab('directory')}
            scans={scans}
          />
        )}

        {/* 2. VERIFY MEDICINE TAB */}
        {currentTab === 'verify' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                    <Scan className="w-5 h-5" />
                  </span>
                  <span>Medicine Packaging & Expiry Verification</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Upload packaging photo or capture using device camera to extract details and verify against registered medicine records.
                </p>
              </div>

              {uploadedImage && (
                <button
                  type="button"
                  onClick={resetVerificationState}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Fresh</span>
                </button>
              )}
            </div>

            {/* Safety banner reminder */}
            <SafetyNoticeBanner compact />

            {/* STEP 1: Image Uploader / Camera */}
            {!uploadedImage && (
              <ImageUploader
                onImageSelected={handleImageSelected}
                isLoading={isAnalyzingImage || isVerifyingMatch}
              />
            )}

            {/* Error Notification */}
            {scanError && !verificationResult && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-rose-900">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Verification Notice</p>
                    <p>{scanError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetVerificationState}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors shrink-0"
                >
                  Upload Clearer Image
                </button>
              </div>
            )}

            {/* STEP 2: Live Scanning & Database Verification View */}
            {uploadedImage && (isAnalyzingImage || isVerifyingMatch) && (
              <ScanningView
                imagePreview={uploadedImage}
                isAnalyzing={isAnalyzingImage}
                isVerifying={isVerifyingMatch}
                isUnknownMode={isUnknownModeScan}
              />
            )}

            {/* STEP 3: Verification Result Report */}
            {uploadedImage && !isAnalyzingImage && !isVerifyingMatch && verificationResult && (
              <div className="space-y-6">
                <VerificationResultCard
                  result={verificationResult}
                  onScanAnother={resetVerificationState}
                  onUpdateData={(updated) => {
                    setExtractedData(updated);
                    handleRunVerification(updated, uploadedImage, false, unknownAnalysis);
                  }}
                />

                {/* Optional Collapsible Adjust / Re-verify Drawer */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all">
                  <button
                    type="button"
                    onClick={() => setShowAdjustFields(!showAdjustFields)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-teal-600" />
                      <span>Need to correct an OCR character? Review & Edit Extracted Fields</span>
                    </span>
                    <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold flex items-center gap-1">
                      {showAdjustFields ? (
                        <>
                          <span>Hide Editor</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Adjust Fields</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </span>
                  </button>

                  {showAdjustFields && extractedData && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <ExtractedDataEditor
                        data={extractedData}
                        onVerify={(editedData) => {
                          setExtractedData(editedData);
                          handleRunVerification(editedData, uploadedImage, false);
                        }}
                        isVerifying={isVerifyingMatch}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* 3. MEDICINE DIRECTORY TAB */}
        {currentTab === 'directory' && (
          <MedicineDirectory />
        )}

        {/* 4. SCAN HISTORY TAB */}
        {currentTab === 'history' && (
          <ScanHistoryView
            scans={scans}
            onDeleteScan={handleDeleteScan}
            onClearAll={handleClearAllScans}
            onScanAnother={() => {
              resetVerificationState();
              setCurrentTab('verify');
            }}
          />
        )}

        {/* 5. DEMO SAMPLES TAB */}
        {currentTab === 'demo' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Simulated Testing Scenarios</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pharmaceutical Demonstration Presets
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Explore how MediVerify AI evaluates authentic batches, expired antibiotic packaging, counterfeit mismatch alerts, and unreadable labels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEMO_SAMPLES.map((sample) => (
                <div
                  key={sample.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {sample.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                          sample.expectedStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sample.expectedStatus === 'EXPIRED'
                            ? 'bg-rose-100 text-rose-800'
                            : sample.expectedStatus === 'MISMATCH_DETECTED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {sample.expectedStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      {sample.subtitle}
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoPreset(sample)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <span>Load & Verify This Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. ADMIN CATALOG TAB */}
        {currentTab === 'admin' && (
          <AdminPanel />
        )}

        {/* 7. SAFETY & HELP TAB */}
        {currentTab === 'help' && (
          <HelpAndSafetyGuide />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-900">MediVerify AI</span>
            <span>• Healthcare packaging verification assistance</span>
          </div>

          <div className="text-[11px] text-center sm:text-right max-w-md text-slate-700">
            AI verification is an assistance tool. Does not guarantee authenticity or replace a licensed medical professional.
          </div>
        </div>
      </footer>

    </div>
  );
}
