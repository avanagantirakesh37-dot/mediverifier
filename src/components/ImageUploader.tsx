import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FlipHorizontal,
  FileImage,
  ArrowRight,
  ShieldAlert,
  Package,
  Layers,
  HelpCircle
} from 'lucide-react';
import { DEMO_SAMPLES } from '../data/demoSamples';
import { DemoSample } from '../types';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string, demoPreset?: DemoSample, isUnknownMedicine?: boolean) => void;
  isLoading?: boolean;
  defaultUnknownMode?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading = false,
  defaultUnknownMode = false,
}) => {
  const [isUnknownMode, setIsUnknownMode] = useState<boolean>(defaultUnknownMode);
  const [activeMode, setActiveMode] = useState<'upload' | 'camera' | 'demo'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up camera stream on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera permissions in your browser or use File Upload.'
          : 'Unable to access camera on this device. Please use File Upload instead.'
      );
      setIsCameraActive(false);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();
    setPreviewUrl(dataUrl);
    onImageSelected(dataUrl, 'image/jpeg', undefined, isUnknownMode);
  };

  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const processFile = (file: File) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Please upload a valid medicine packaging image in JPG, PNG, or WebP format.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPreviewUrl(result);
        onImageSelected(result, file.type, undefined, isUnknownMode);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectDemo = (sample: DemoSample) => {
    // Generate a clean mock packaging data URL for the demo
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw simulated pharmaceutical packaging
      const isExpired = sample.expectedStatus === 'EXPIRED';
      const isMismatch = sample.expectedStatus === 'MISMATCH_DETECTED';

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 600, 400);

      // Card border & header bar
      ctx.fillStyle = isExpired ? '#e11d48' : isMismatch ? '#d97706' : '#0d9488';
      ctx.fillRect(20, 20, 560, 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(sample.medicineData.medicine_name || 'Medicine Package', 40, 46);

      // Inner card
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 60, 560, 320);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 560, 360);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(sample.medicineData.generic_name || '', 40, 100);

      ctx.fillStyle = '#475569';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Mfr: ${sample.medicineData.manufacturer || ''}`, 40, 130);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`B.No: ${sample.medicineData.batch_number || 'N/A'}`, 40, 170);
      ctx.fillText(`MFD: ${sample.medicineData.manufacturing_date || 'N/A'}`, 40, 200);

      ctx.fillStyle = isExpired ? '#be123c' : '#047857';
      ctx.fillText(`EXP: ${sample.medicineData.expiry_date || 'N/A'}`, 40, 230);

      ctx.fillStyle = '#334155';
      ctx.font = '14px sans-serif';
      ctx.fillText(`M.R.P.: ${sample.medicineData.mrp || 'N/A'}`, 40, 260);

      // Barcode simulation
      if (sample.medicineData.barcode) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(40, 290, 200, 45);
        ctx.fillStyle = '#ffffff';
        // barcode stripes
        for (let i = 45; i < 235; i += 7) {
          ctx.fillRect(i, 290, 3, 45);
        }
        ctx.fillStyle = '#334155';
        ctx.font = '12px monospace';
        ctx.fillText(sample.medicineData.barcode, 70, 350);
      }

      // Security seal stamp
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(400, 100, 150, 80);
      ctx.fillStyle = '#0d9488';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('SECURITY SEAL', 425, 130);
      ctx.fillText('AUTHENTIC BATCH', 420, 150);

      const generatedUrl = canvas.toDataURL('image/png');
      setPreviewUrl(generatedUrl);
      onImageSelected(generatedUrl, 'image/png', sample, isUnknownMode);
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-4">
      {/* Target Category Selection: Standard vs Unknown Medicine */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setIsUnknownMode(false)}
          className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
            !isUnknownMode
              ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs text-slate-900'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${!isUnknownMode ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <Package className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Standard Packaging Verification</span>
              {!isUnknownMode && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              For branded medicine boxes, blister strips, and labelled pharmaceutical packages.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsUnknownMode(true)}
          className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
            isUnknownMode
              ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-xs text-slate-900'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${isUnknownMode ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Upload Unknown Medicine</span>
              <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 text-[9px] font-black rounded uppercase tracking-wider">
                High Care
              </span>
              {isUnknownMode && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              For loose pills, unlabelled strips, unfamiliar capsules, or unmarked bottles.
            </p>
          </div>
        </button>
      </div>

      {/* High-Care Unknown Medicine Protocol Banner */}
      {isUnknownMode && (
        <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-3 max-w-2xl mx-auto shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-2">
              <span>High-Care Clinical Inspection Protocol Active</span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded">
                Extreme Caution
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              When you upload an unknown medicine, MediVerify AI will deeply analyze tablet shape, color, debossed imprint codes (letters/numbers imprinted on the pill), score lines, and micro-embossed dates, and screen for physical anomalies.
            </p>
            <p className="text-[10px] font-semibold text-amber-800">
              ⚠️ Safety Notice: Never ingest unidentified medicine. This tool provides identification assistance only.
            </p>
          </div>
        </div>
      )}

      {/* Mode Navigation Tabs */}
      <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveMode('upload');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            activeMode === 'upload'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode('camera');
            startCamera();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            activeMode === 'camera'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Camera Scan</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveMode('demo');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            activeMode === 'demo'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Demo Samples</span>
        </button>
      </div>

      {/* Main Upload / Camera / Demo Zone */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
        
        {/* If Image is Selected & Preview Available */}
        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-[380px]">
              <img
                src={previewUrl}
                alt="Selected medicine packaging preview"
                className="max-h-[360px] w-auto object-contain mx-auto"
              />
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full backdrop-blur-xs transition-colors"
                title="Remove and choose another image"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Scanning visual overlay when loading */}
              {isLoading && (
                <div className="absolute inset-0 bg-teal-900/30 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent absolute top-0 animate-bounce" />
                  <div className="p-3 bg-slate-900/90 rounded-xl flex items-center gap-3 border border-teal-500/40 shadow-xl">
                    <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
                    <div>
                      <p className="text-sm font-semibold">Analyzing Medicine Packaging...</p>
                      <p className="text-xs text-slate-300">Checking quality, OCR text & expiry dates</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 px-1">
              <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Packaging image ready for analysis
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-slate-600 hover:text-slate-800 underline font-medium"
              >
                Change Photo
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode 1: File Upload */}
            {activeMode === 'upload' && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-teal-500 bg-teal-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-teal-600 mb-4 group-hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  Upload or drag & drop medicine packaging
                </h3>
                <p className="text-xs text-slate-700 max-w-sm mx-auto mb-4">
                  Photograph the label, blister strip, box, or bottle showing the medicine name, batch number, and expiry date.
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs">
                  <FileImage className="w-4 h-4" />
                  <span>Choose Image File</span>
                </div>

                <p className="text-[11px] text-slate-700 mt-4">
                  Supports JPG, JPEG, PNG, and WebP (up to 15MB)
                </p>
              </div>
            )}

            {/* Mode 2: Live Camera Scan */}
            {activeMode === 'camera' && (
              <div className="space-y-4">
                {cameraError ? (
                  <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                    <p className="text-sm font-medium text-rose-900">{cameraError}</p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
                      >
                        Retry Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMode('upload')}
                        className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg"
                      >
                        Switch to File Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] max-h-[420px] flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Camera Viewfinder Overlay Guides */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                      <div className="flex justify-between items-center text-white/80 text-xs">
                        <span className="px-2 py-1 bg-black/50 backdrop-blur-xs rounded">
                          Position medicine packaging in frame
                        </span>
                        <span className="px-2 py-1 bg-teal-600/80 backdrop-blur-xs rounded text-white font-mono">
                          LIVE
                        </span>
                      </div>

                      {/* Center Targeting Box */}
                      <div className="relative w-4/5 h-3/5 mx-auto border-2 border-dashed border-teal-400/80 rounded-xl flex items-center justify-center">
                        <div className="w-4 h-4 border-t-2 border-l-2 border-teal-400 absolute -top-1 -left-1" />
                        <div className="w-4 h-4 border-t-2 border-r-2 border-teal-400 absolute -top-1 -right-1" />
                        <div className="w-4 h-4 border-b-2 border-l-2 border-teal-400 absolute -bottom-1 -left-1" />
                        <div className="w-4 h-4 border-b-2 border-r-2 border-teal-400 absolute -bottom-1 -right-1" />
                        <p className="text-[11px] text-white/70 bg-black/40 px-2 py-1 rounded backdrop-blur-xs text-center">
                          Ensure Batch & Expiry dates are clear & in focus
                        </p>
                      </div>

                      <div className="text-center text-[11px] text-white/70">
                        Hold steady with sufficient lighting
                      </div>
                    </div>

                    {/* Camera Control Actions */}
                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
                      <button
                        type="button"
                        onClick={handleFlipCamera}
                        className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-xs transition-colors"
                        title="Flip Camera (Front/Rear)"
                      >
                        <FlipHorizontal className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleCaptureSnapshot}
                        className="p-4 bg-teal-500 hover:bg-teal-400 text-white rounded-full shadow-lg ring-4 ring-white/30 hover:scale-105 transition-all"
                        title="Capture Photo"
                      >
                        <Camera className="w-6 h-6" />
                      </button>

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-xs transition-colors"
                        title="Cancel Camera"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 3: Demo Packaging Presets */}
            {activeMode === 'demo' && (
              <div className="space-y-3">
                <div className="text-left mb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Select a Demonstration Medicine Package
                  </h4>
                  <p className="text-xs text-slate-700">
                    Click any sample to test the complete image processing, quality check, OCR extraction, and verification workflow:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEMO_SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectDemo(sample)}
                      className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
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
                        <p className="text-[11px] text-slate-700">
                          {sample.subtitle}
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-2 pt-1">
                          {sample.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                        <span>Load this package</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
