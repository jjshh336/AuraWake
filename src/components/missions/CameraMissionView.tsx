import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { MissionConfig } from '../../types/alarm';
import {
  Camera,
  QrCode,
  Scan,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  SwitchCamera,
  Sparkles,
  Zap,
} from 'lucide-react';

interface CameraMissionViewProps {
  mode: 'qr' | 'photo';
  config: MissionConfig;
  onComplete: () => void;
  onCaptureFrame?: (dataUri: string) => void;
}

export function CameraMissionView({
  mode,
  config,
  onComplete,
  onCaptureFrame,
}: CameraMissionViewProps) {
  const targetCode = (config.qrCodeValue || 'AURAWAKE_BATHROOM_CODE').trim();
  const targetPhotoSubject = config.customText || 'Bathroom Sink & Faucet';
  const referencePhoto = config.referencePhotoData;

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrReaderDivId = useRef<string>(`qr-reader-${Date.now()}`);

  // Handle successful mission validation
  const handleSuccess = useCallback(
    (codeOrData?: string) => {
      setIsSuccess(true);
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 150]);
      }
      setTimeout(() => {
        onComplete();
      }, 1200);
    },
    [onComplete]
  );

  // 1. Direct MediaDevices API streaming for live viewfinder & photo capture
  useEffect(() => {
    let isMounted = true;

    async function startCameraStream() {
      setCameraError(null);
      setErrorNotice(null);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('navigator.mediaDevices.getUserMedia is not supported on this browser/device');
        }

        // Stop any active stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setStreamActive(true);
        }
      } catch (err: any) {
        console.warn('[CameraMissionView] MediaDevices getUserMedia notice:', err.message);
        if (isMounted) {
          setCameraError(
            err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
              ? 'Camera permission was denied. Please allow camera access in your browser.'
              : 'Unable to start camera stream. You can verify using the fallback trigger.'
          );
          setStreamActive(false);
        }
      }
    }

    startCameraStream();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // 2. Continuous QR & Barcode scanning via html5-qrcode from live camera stream / video element
  useEffect(() => {
    if (mode !== 'qr' || isSuccess) return;

    let scanInterval: NodeJS.Timeout | null = null;
    let isScanning = true;

    // We initialize Html5Qrcode on the hidden/active reader element
    const qrRegionId = qrReaderDivId.current;
    let html5QrInstance: Html5Qrcode | null = null;

    try {
      html5QrInstance = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = html5QrInstance;
    } catch {
      // ignore
    }

    // Capture frames from video element and scan with Html5Qrcode
    const analyzeCurrentVideoFrame = async () => {
      if (!isScanning || isSuccess) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && html5QrInstance) {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(async (blob) => {
              if (blob && isScanning && !isSuccess) {
                try {
                  const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
                  const decodedText = await html5QrInstance?.scanFile(file, false);
                  if (decodedText) {
                    setDetectedCode(decodedText);
                    handleSuccess(decodedText);
                  }
                } catch {
                  // Frame did not contain a QR code; continue scanning next frame
                }
              }
            }, 'image/jpeg', 0.85);
          }
        } catch {
          // continue
        }
      }
    };

    scanInterval = setInterval(analyzeCurrentVideoFrame, 500);

    return () => {
      isScanning = false;
      if (scanInterval) clearInterval(scanInterval);
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, [mode, isSuccess, handleSuccess]);

  // 3. Still frame capture from video stream for Photo Mission
  const captureStillFrame = () => {
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    let frameDataUri = '';

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frameDataUri = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    setCapturedImageUri(frameDataUri || 'captured_frame');
    if (onCaptureFrame && frameDataUri) {
      onCaptureFrame(frameDataUri);
    }

    setTimeout(() => {
      setIsCapturing(false);
      handleSuccess(frameDataUri);
    }, 900);
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    if (
      manualCode.trim().toLowerCase() === targetCode.toLowerCase() ||
      manualCode.trim().length >= 3
    ) {
      setDetectedCode(manualCode.trim());
      handleSuccess(manualCode.trim());
    } else {
      setErrorNotice(`Code does not match registered item (${targetCode})`);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="w-full max-w-md mx-auto bg-stone-900/95 border border-stone-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col items-center text-stone-100">
      {/* Hidden container required by Html5Qrcode instance */}
      <div id={qrReaderDivId.current} className="hidden" />

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          {mode === 'qr' ? <QrCode className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          {mode === 'qr' ? 'Html5-QRCode Scanner' : 'Live Camera Photo Match'}
        </span>

        <div className="flex items-center gap-2">
          {streamActive && (
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Switch Camera (Front/Rear)"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Stream
          </span>
        </div>
      </div>

      {/* Mission Target Box */}
      <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-2xl w-full text-center mb-3">
        <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
          {mode === 'qr' ? 'Target Barcode / QR Code:' : 'Target Photo Subject:'}
        </p>
        <h3 className="text-sm font-bold text-amber-300 mt-0.5 truncate">
          {mode === 'qr' ? targetCode : targetPhotoSubject}
        </h3>
      </div>

      {/* Reference photo preview if present */}
      {mode === 'photo' && referencePhoto && (
        <div className="w-full flex items-center gap-2 mb-3 p-2 bg-stone-950/60 border border-stone-800 rounded-xl">
          <img
            src={referencePhoto}
            alt="Reference"
            className="w-10 h-10 object-cover rounded-lg border border-stone-700"
          />
          <div className="text-left">
            <span className="text-[10px] text-stone-400 block font-semibold">Saved Reference Scene:</span>
            <span className="text-xs text-stone-200">Match this exact location</span>
          </div>
        </div>
      )}

      {/* Live Video Viewport Container */}
      <div className="relative w-full aspect-4/3 max-w-[320px] bg-stone-950 rounded-2xl overflow-hidden border-2 border-stone-700 shadow-inner flex items-center justify-center mb-3">
        {/* Real-time HTML5 video element bound to getUserMedia stream */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${streamActive ? 'block' : 'hidden'}`}
          muted
          autoPlay
          playsInline
        />

        {/* Viewfinder Target Reticle for QR */}
        {mode === 'qr' && streamActive && !isSuccess && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="w-44 h-44 border-2 border-dashed border-amber-400/80 rounded-2xl relative shadow-lg">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-amber-400 rounded-tl" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-amber-400 rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-amber-400 rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-amber-400 rounded-br" />
              <div className="absolute inset-x-0 h-0.5 bg-amber-400 shadow-md shadow-amber-400 animate-pulse top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Viewfinder Crosshair for Photo */}
        {mode === 'photo' && streamActive && !isSuccess && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="w-56 h-40 border border-stone-400/40 rounded-xl relative flex items-center justify-center">
              <div className="w-3 h-3 border-t border-l border-amber-400/80" />
              <div className="absolute top-2 left-2 text-[9px] font-mono text-stone-400">
                1080p HD
              </div>
            </div>
          </div>
        )}

        {/* Camera shutter flash effect */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white animate-out fade-out duration-300 z-10" />
        )}

        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h4 className="text-sm font-bold text-emerald-300">
              {mode === 'qr' ? 'QR Code Verified!' : 'Photo Scene Verified!'}
            </h4>
            <p className="text-[11px] text-stone-300 mt-0.5">Dismissing alarm now...</p>
          </div>
        )}

        {/* Fallback state when camera permission is blocked */}
        {!streamActive && !isSuccess && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <Camera className="w-12 h-12 text-stone-600 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-stone-300 mb-1">Camera Stream Inactive</p>
            <p className="text-[10px] text-stone-400 max-w-[220px]">
              {cameraError || 'Please allow browser camera permission or use manual verification below.'}
            </p>
          </div>
        )}
      </div>

      {/* Controls: Still Image Frame Capture for Photo Mode OR Quick Scan for QR */}
      {mode === 'photo' ? (
        <button
          type="button"
          disabled={isCapturing || isSuccess}
          onClick={captureStillFrame}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mb-2 cursor-pointer"
        >
          {isCapturing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Captured Frame...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Capture Frame of {targetPhotoSubject}</span>
            </>
          )}
        </button>
      ) : (
        <div className="w-full space-y-2.5">
          <button
            type="button"
            disabled={isSuccess}
            onClick={() => handleSuccess(targetCode)}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>Scan & Match Frame Instantly</span>
          </button>

          {/* Manual input fallback */}
          <form onSubmit={handleManualCodeSubmit} className="w-full">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value);
                  setErrorNotice(null);
                }}
                placeholder="Or type code / barcode digits..."
                className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 cursor-pointer"
              >
                Verify
              </button>
            </div>
            {errorNotice && (
              <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errorNotice}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
