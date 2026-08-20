import { useState, useRef, useEffect } from 'react';
import {
  MissionConfig,
  MissionType,
  MissionDifficulty,
} from '../../types/alarm';
import {
  X,
  ChevronLeft,
  Camera,
  QrCode,
  Keyboard,
  Flame,
  Calculator,
  Grid3X3,
  SmartphoneCharging,
  Footprints,
  Dumbbell,
  Sparkles,
  Zap,
  Check,
  Play,
  RotateCcw,
  Sun,
  Moon,
  Volume2,
  Mic,
  Image as ImageIcon,
  Upload,
  SwitchCamera,
  HelpCircle,
} from 'lucide-react';
import jsQR from 'jsqr';

interface MissionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMission: (config: MissionConfig) => void;
  initialConfig?: MissionConfig | null;
  onRequestPermissions?: (type: 'camera' | 'mic' | 'motion') => void;
  isLight?: boolean;
}

const PRESET_PHRASES = [
  'I withstand challenges with ease and grace.',
  'I am disciplined, energized, and ready to conquer this morning.',
  'Every single day is a fresh opportunity to excel.',
  'Rise early, think clearly, and act boldly.',
  'RADHA RADHA RADHA RADHA',
];

const PRESET_MANTRAS = [
  { name: 'RADHA RADHA', desc: 'Divine Vrindavan Mahamantra' },
  { name: 'RADHE RADHE', desc: 'Sacred Devotional Name' },
  { name: 'HARE KRISHNA HARE RAMA', desc: 'Maha Mantra of Peace' },
  { name: 'OM NAMAH SHIVAYA', desc: 'Panchakshara Shiva Mantra' },
  { name: 'JAI SHREE RAM', desc: 'Supreme Victory Mantra' },
  { name: 'GAYATRI MANTRA', desc: 'Rigvedic Solar Illumination' },
  { name: 'MAHA MRITYUNJAYA', desc: 'Life Affirming Shiva Stotra' },
];

const PRESET_PHOTO_SCENES = [
  { id: 'sink', name: 'Bathroom Sink & Faucet', icon: '🚰', desc: 'Forces you to get out of bed to the bathroom' },
  { id: 'toothbrush', name: 'Toothpaste & Toothbrush', icon: '🪥', desc: 'Start your hygiene routine immediately' },
  { id: 'coffee', name: 'Coffee Machine / Mug', icon: '☕', desc: 'Walk to the kitchen for morning brew' },
  { id: 'balcony', name: 'Balcony / Window Sunlight', icon: '🌅', desc: 'Get natural morning daylight' },
  { id: 'book', name: 'Study Desk & Book', icon: '📚', desc: 'Head straight to your morning study area' },
];

export function MissionSetupModal({
  isOpen,
  onClose,
  onSaveMission,
  initialConfig,
  onRequestPermissions,
  isLight = false,
}: MissionSetupModalProps) {
  const missionType: MissionType = initialConfig?.type || 'typing';

  // State for all mission configurations
  const [difficulty, setDifficulty] = useState<MissionDifficulty>(
    initialConfig?.difficulty || 'medium'
  );
  const [repeatCount, setRepeatCount] = useState<number>(
    initialConfig?.repeatCount || 4
  );
  const [roundsMultiplier, setRoundsMultiplier] = useState<number>(
    initialConfig?.roundsMultiplier || 4
  );
  const [targetCount, setTargetCount] = useState<number>(
    initialConfig?.targetCount || (missionType === 'chant' ? 108 : 20)
  );
  const [customText, setCustomText] = useState<string>(
    initialConfig?.customText || PRESET_PHRASES[0]
  );
  const [chantPhrase, setChantPhrase] = useState<string>(
    initialConfig?.chantPhrase || 'RADHA RADHA'
  );
  const [qrCodeValue, setQrCodeValue] = useState<string>(
    initialConfig?.qrCodeValue || 'AURAWAKE_BATHROOM_CODE'
  );
  const [referencePhotoData, setReferencePhotoData] = useState<string | undefined>(
    initialConfig?.referencePhotoData
  );

  // Sub-screens & Camera viewports
  const [showPhrasePicker, setShowPhrasePicker] = useState(false);
  const [showMantraPicker, setShowMantraPicker] = useState(false);
  const [showFullCamera, setShowFullCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Camera & Video Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialConfig) {
      setDifficulty(initialConfig.difficulty || 'medium');
      setRepeatCount(initialConfig.repeatCount || (missionType === 'typing' ? 4 : 3));
      setRoundsMultiplier(initialConfig.roundsMultiplier || 4);
      setTargetCount(initialConfig.targetCount || (missionType === 'chant' ? 108 : 20));
      setCustomText(initialConfig.customText || PRESET_PHRASES[0]);
      setChantPhrase(initialConfig.chantPhrase || 'RADHA RADHA');
      setQrCodeValue(initialConfig.qrCodeValue || 'AURAWAKE_BATHROOM_CODE');
      setReferencePhotoData(initialConfig.referencePhotoData);
    }
  }, [initialConfig, missionType, isOpen]);

  // Handle live full camera stream when taking reference photo or QR
  useEffect(() => {
    if (!showFullCamera) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;
    async function startCam() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera API not available');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: cameraFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }
      } catch (err: any) {
        console.warn('Full camera error:', err.message);
      }
    }

    startCam();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [showFullCamera, cameraFacing]);

  if (!isOpen) return null;

  // Total chant calculation
  const totalChants = (targetCount || 108) * (roundsMultiplier || 4);

  const handleSnapPhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    let dataUri = '';
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        dataUri = canvas.toDataURL('image/jpeg', 0.85);
      }
    }
    setReferencePhotoData(dataUri || 'preset_photo_saved');
    setShowFullCamera(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          setReferencePhotoData(ev.target.result);
          setShowFullCamera(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    const finalConfig: MissionConfig = {
      id: initialConfig?.id || `m-${Date.now()}`,
      type: missionType,
      difficulty,
      questionCount: repeatCount,
      repeatCount,
      roundsMultiplier,
      targetCount: missionType === 'chant' ? targetCount : undefined,
      customText: missionType === 'typing' ? customText : missionType === 'photo' ? customText : undefined,
      chantPhrase: missionType === 'chant' ? chantPhrase : undefined,
      qrCodeValue: missionType === 'qr' ? qrCodeValue : undefined,
      referencePhotoData,
    };
    onSaveMission(finalConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Container - styled like Screenshot 1 & 2 */}
      <div
        id="mission-setup-view"
        className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-md bg-[#101012] text-white flex flex-col sm:rounded-3xl border sm:border-stone-800 shadow-2xl relative overflow-hidden"
      >
        {/* Header Bar matching Screenshot 1: "< Typing ✕" */}
        <div className="px-5 py-4 border-b border-stone-800/80 flex items-center justify-between select-none">
          <button
            type="button"
            onClick={onClose}
            className="p-1 -ml-2 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 className="text-base font-bold capitalize text-stone-100">
            {missionType === 'chant'
              ? 'Sacred Chanting'
              : missionType === 'qr'
              ? 'QR / Barcode'
              : missionType === 'photo'
              ? 'Photo'
              : missionType}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-2 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ===================== TYPING MISSION VIEW (Screenshot 1) ===================== */}
          {missionType === 'typing' && (
            <div className="space-y-6">
              {/* Example Quote Card */}
              <div className="p-4 bg-[#1a1a1e] rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Example
                  </span>
                </div>
                <p className="text-base font-medium text-stone-200 leading-relaxed font-sans">
                  {customText}
                </p>
              </div>

              {/* Repetition Scroll Wheel / Selector matching Screenshot 1 */}
              <div className="flex flex-col items-center justify-center py-4 bg-[#141416] rounded-3xl border border-stone-800/80 relative">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Repeat Count
                </span>

                {/* Vertical Wheel Numbers */}
                <div className="flex flex-col items-center gap-1 select-none my-1">
                  <button
                    type="button"
                    onClick={() => setRepeatCount((prev) => Math.max(1, prev - 1))}
                    className="text-lg font-bold text-stone-500 hover:text-stone-400 cursor-pointer transition-all"
                  >
                    {Math.max(1, repeatCount - 1)} times
                  </button>

                  <div className="px-6 py-2 rounded-2xl bg-stone-800/80 border border-stone-700 text-2xl font-black text-white shadow-md flex items-center justify-center scale-105">
                    {repeatCount} times
                  </div>

                  <button
                    type="button"
                    onClick={() => setRepeatCount((prev) => Math.min(15, prev + 1))}
                    className="text-lg font-bold text-stone-500 hover:text-stone-400 cursor-pointer transition-all"
                  >
                    {Math.min(15, repeatCount + 1)} times
                  </button>
                </div>

                {/* Quick select pills */}
                <div className="flex gap-2 mt-3">
                  {[1, 2, 3, 4, 5, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRepeatCount(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        repeatCount === num
                          ? 'bg-white text-stone-950 font-bold'
                          : 'bg-[#1f1f24] text-stone-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Phrase Card matching Screenshot 1 */}
              <div
                onClick={() => setShowPhrasePicker(true)}
                className="p-4 bg-[#1a1a1e] rounded-2xl border border-stone-800 flex items-center justify-between cursor-pointer hover:border-stone-700 transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold text-stone-200">Select phrase</h4>
                  <p className="text-xs text-stone-400 truncate max-w-[240px] mt-0.5">
                    {customText}
                  </p>
                </div>
                <span className="text-xs text-stone-400 font-semibold flex items-center gap-1">
                  1 phrase &gt;
                </span>
              </div>
            </div>
          )}

          {/* ===================== PHOTO MISSION VIEW (Screenshot 2) ===================== */}
          {missionType === 'photo' && (
            <div className="space-y-6">
              {/* Header Title */}
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-stone-100">
                  Take a photo of a part of your morning routine
                </h3>
                <p className="text-xs text-stone-400">
                  To dismiss the alarm, take a photo of the same item or scene
                </p>
              </div>

              {/* Viewfinder Preview Box matching Screenshot 2 */}
              <div
                onClick={() => setShowFullCamera(true)}
                className="w-full aspect-square max-w-[280px] mx-auto bg-[#18181b] rounded-3xl border-2 border-stone-800 flex flex-col items-center justify-center relative cursor-pointer group hover:border-stone-700 transition-all overflow-hidden shadow-2xl"
              >
                {referencePhotoData ? (
                  <div className="relative w-full h-full">
                    <img
                      src={referencePhotoData}
                      alt="Reference"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-white bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-700">
                        Tap to Retake Photo 📸
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Viewfinder Corner Target Brackets [ + ] */}
                    <div className="w-44 h-44 border border-stone-600/50 rounded-2xl relative flex items-center justify-center">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-stone-400 absolute top-2 left-2 rounded-tl" />
                      <div className="w-4 h-4 border-t-2 border-r-2 border-stone-400 absolute top-2 right-2 rounded-tr" />
                      <div className="w-4 h-4 border-b-2 border-l-2 border-stone-400 absolute bottom-2 left-2 rounded-bl" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-stone-400 absolute bottom-2 right-2 rounded-br" />

                      {/* Center target cross */}
                      <span className="text-2xl text-stone-600 font-light">+</span>
                    </div>

                    {/* Red Camera Shutter Circle Preview in center */}
                    <div className="mt-4 w-12 h-12 rounded-full bg-red-600 border-4 border-white/20 flex items-center justify-center shadow-lg shadow-red-600/40 group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </>
                )}
              </div>

              {/* Quick Preset Morning Scenes */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Or pick a morning routine scene:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_PHOTO_SCENES.map((scene) => (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => {
                        setCustomText(scene.name);
                        setReferencePhotoData(undefined);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        customText === scene.name
                          ? 'bg-stone-800 border-stone-600 text-white font-bold'
                          : 'bg-[#18181c] border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="text-lg">{scene.icon}</span>
                      <span className="text-xs truncate">{scene.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload image option */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-[#1a1a1e] hover:bg-[#222226] border border-stone-800 rounded-xl text-xs font-bold text-stone-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload image from gallery 🖼️</span>
              </button>
            </div>
          )}

          {/* ===================== QR / BARCODE MISSION VIEW (Screenshot 4) ===================== */}
          {missionType === 'qr' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-stone-100">
                  Place a QR/Barcode inside the rectangle
                </h3>
                <p className="text-xs text-stone-400">
                  Scan any household item (toothpaste, shampoo, book, or snack)
                </p>
              </div>

              {/* Live Barcode Scanner Frame matching Screenshot 4 */}
              <div
                onClick={() => setShowFullCamera(true)}
                className="w-full aspect-4/3 max-w-[320px] mx-auto bg-[#141416] rounded-3xl border-2 border-stone-800 flex flex-col items-center justify-center relative cursor-pointer overflow-hidden shadow-2xl"
              >
                {/* Target Scanning Rectangle */}
                <div className="w-56 h-36 border-2 border-amber-400/80 rounded-2xl relative shadow-lg flex items-center justify-center">
                  <div className="absolute inset-x-0 h-0.5 bg-amber-400 shadow-md shadow-amber-400 animate-pulse" />
                  <span className="text-[10px] text-amber-300/80 font-mono bg-stone-900/80 px-2 py-0.5 rounded">
                    {qrCodeValue || 'Tap to Scan Code'}
                  </span>
                </div>
              </div>

              {/* Registered Barcode Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">
                  Registered Code / Barcode Digits:
                </label>
                <input
                  type="text"
                  value={qrCodeValue}
                  onChange={(e) => setQrCodeValue(e.target.value)}
                  placeholder="E.g. AURAWAKE_BATHROOM_CODE or 890123456789"
                  className="w-full px-3.5 py-2.5 bg-[#18181c] border border-stone-700 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* ===================== SACRED CHANTING MISSION VIEW ===================== */}
          {missionType === 'chant' && (
            <div className="space-y-5">
              {/* Mantra Selector Card */}
              <div
                onClick={() => setShowMantraPicker(true)}
                className="p-4 bg-gradient-to-r from-red-950/80 to-stone-950 rounded-2xl border-2 border-yellow-500/40 flex items-center justify-between cursor-pointer hover:border-yellow-400 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-yellow-400 text-stone-950">
                    <Flame className="w-5 h-5 fill-stone-950" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider block">
                      Target Mantra / Phrase
                    </span>
                    <h3 className="text-lg font-black text-yellow-300 tracking-wide">
                      "{chantPhrase}"
                    </h3>
                  </div>
                </div>
                <span className="text-xs text-yellow-400 font-bold">Change &gt;</span>
              </div>

              {/* Dynamic Formula Display: e.g. 108 chants x 4 times = 432 total chants! */}
              <div className="p-4 bg-[#18080a] border border-yellow-500/30 rounded-2xl text-center space-y-2">
                <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-widest block">
                  Total Wake-Up Chants
                </span>
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-yellow-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  {targetCount} Chants × {roundsMultiplier} Rounds ={' '}
                  <span className="underline decoration-red-500 text-yellow-400 font-mono">
                    {totalChants} Total
                  </span>
                </div>
                <p className="text-[11px] text-red-200/70">
                  Repeat the holy name {totalChants} times aloud or by sacred tap to dismiss
                </p>
              </div>

              {/* Base Chants Selector */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-stone-300">
                  <span>Base Mala Chants:</span>
                  <span className="text-yellow-400 font-mono font-black">{targetCount} Chants</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[10, 20, 27, 54, 108].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTargetCount(n)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        targetCount === n
                          ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 shadow-md'
                          : 'bg-[#18181c] text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rounds Multiplier Selector */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-stone-300">
                  <span>Repetition Rounds (Times Repeated):</span>
                  <span className="text-yellow-400 font-mono font-black">{roundsMultiplier} Times</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {[1, 2, 4, 8, 12, 16].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRoundsMultiplier(n)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        roundsMultiplier === n
                          ? 'bg-yellow-400 text-stone-950 font-black shadow-md'
                          : 'bg-[#18181c] text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== MATH MISSION VIEW ===================== */}
          {missionType === 'math' && (
            <div className="space-y-5">
              {/* Difficulty tabs */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Difficulty
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as MissionDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2.5 rounded-xl text-xs font-black capitalize transition-all cursor-pointer ${
                        difficulty === d
                          ? 'bg-white text-stone-950'
                          : 'bg-[#18181c] text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of problems wheel */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-stone-300">
                  <span>Number of Problems:</span>
                  <span className="text-white font-mono font-black">{repeatCount} Problems</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 3, 5, 10, 20].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRepeatCount(n)}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        repeatCount === n
                          ? 'bg-white text-stone-950'
                          : 'bg-[#18181c] text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== SHAKE / STEPS / SQUATS ===================== */}
          {(missionType === 'shake' || missionType === 'steps' || missionType === 'squats') && (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-stone-300">
                  <span>Target Count:</span>
                  <span className="text-white font-mono font-black">{targetCount}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(missionType === 'shake'
                    ? [20, 40, 60, 100]
                    : missionType === 'steps'
                    ? [15, 30, 50, 100]
                    : [5, 10, 15, 25]
                  ).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTargetCount(n)}
                      className={`py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        targetCount === n
                          ? 'bg-white text-stone-950'
                          : 'bg-[#18181c] text-stone-400 hover:text-white border border-stone-800'
                      }`}
                    >
                      {n} {missionType}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions matching Screenshot 1 & 2: [ Preview ] [ Complete / Photo ] */}
        <div className="p-4 border-t border-stone-800/80 bg-[#121214] flex items-center gap-3">
          {missionType === 'photo' && !referencePhotoData ? (
            <button
              id="mission-take-photo-btn"
              type="button"
              onClick={() => setShowFullCamera(true)}
              className="flex-1 py-4 bg-white hover:bg-stone-200 active:bg-stone-300 text-stone-950 font-black text-sm rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span>Photo</span>
            </button>
          ) : (
            <>
              <button
                id="mission-preview-btn"
                type="button"
                onClick={() => setIsPreviewing(true)}
                className="px-6 py-3.5 bg-[#202024] hover:bg-[#28282e] text-stone-300 font-bold text-xs rounded-full border border-stone-700/80 transition-all cursor-pointer"
              >
                Preview
              </button>

              <button
                id="mission-complete-btn"
                type="button"
                onClick={handleComplete}
                className="flex-1 py-3.5 bg-white hover:bg-stone-200 active:bg-stone-300 text-stone-950 font-black text-sm rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Complete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Full-Screen Camera Viewfinder Modal matching Screenshot 3 & 4 */}
      {showFullCamera && (
        <div className="fixed inset-0 z-70 bg-black flex flex-col justify-between text-white select-none">
          {/* Top Bar with Flash Toggle & Close */}
          <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent relative z-20">
            <button
              type="button"
              onClick={() => setFlashEnabled((prev) => !prev)}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                flashEnabled
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-black/50 text-stone-300 border-stone-700'
              }`}
            >
              <Zap className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-stone-200">
              {missionType === 'qr' ? 'Scan Code' : 'Capture Scene'}
            </span>

            <button
              type="button"
              onClick={() => setShowFullCamera(false)}
              className="p-2 rounded-full bg-black/50 text-stone-300 hover:text-white border border-stone-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central Live Video Stream Container */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Target Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="w-64 h-64 border-2 border-stone-400/60 rounded-3xl relative flex items-center justify-center">
                <div className="w-6 h-6 border-t-4 border-l-4 border-white absolute top-0 left-0 rounded-tl-xl" />
                <div className="w-6 h-6 border-t-4 border-r-4 border-white absolute top-0 right-0 rounded-tr-xl" />
                <div className="w-6 h-6 border-b-4 border-l-4 border-white absolute bottom-0 left-0 rounded-bl-xl" />
                <div className="w-6 h-6 border-b-4 border-r-4 border-white absolute bottom-0 right-0 rounded-br-xl" />
              </div>
            </div>
          </div>

          {/* Bottom Controls Bar matching Screenshot 3 */}
          <div className="p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-around relative z-20">
            {/* Flip Camera */}
            <button
              type="button"
              onClick={() =>
                setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'))
              }
              className="p-3.5 rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
            >
              <SwitchCamera className="w-6 h-6" />
            </button>

            {/* Big Circular Red Shutter Button (Screenshot 3) */}
            <button
              id="camera-shutter-snap-btn"
              type="button"
              onClick={handleSnapPhoto}
              className="w-20 h-20 rounded-full bg-red-600 border-4 border-white flex items-center justify-center shadow-2xl active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full border-2 border-red-800" />
            </button>

            {/* Gallery Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
            >
              <ImageIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Phrase Picker Sub-Modal */}
      {showPhrasePicker && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#18181c] border border-stone-800 rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Choose Affirmation Phrase</h3>
              <button
                type="button"
                onClick={() => setShowPhrasePicker(false)}
                className="text-stone-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {PRESET_PHRASES.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => {
                    setCustomText(phrase);
                    setShowPhrasePicker(false);
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    customText === phrase
                      ? 'bg-stone-800 border-stone-600 text-white font-bold'
                      : 'bg-[#121214] border-stone-800 text-stone-300 hover:text-white'
                  }`}
                >
                  {phrase}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-400 mb-1 block">
                Or type your own custom affirmation:
              </label>
              <textarea
                rows={2}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-2.5 bg-[#121214] border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-stone-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPhrasePicker(false)}
              className="w-full py-2.5 bg-white text-stone-950 font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Mantra Picker Sub-Modal */}
      {showMantraPicker && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1a080c] border-2 border-yellow-500/40 rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-yellow-400">Select Sacred Mantra</h3>
              <button
                type="button"
                onClick={() => setShowMantraPicker(false)}
                className="text-stone-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {PRESET_MANTRAS.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    setChantPhrase(m.name);
                    setShowMantraPicker(false);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    chantPhrase === m.name
                      ? 'bg-gradient-to-r from-red-600 to-yellow-400 text-stone-950 font-black'
                      : 'bg-[#120406] border-red-900/50 text-yellow-200 hover:text-yellow-300'
                  }`}
                >
                  <div className="text-xs font-black">{m.name}</div>
                  <div className="text-[10px] opacity-80">{m.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-bold text-red-200 mb-1 block">
                Or type custom mantra / prayer:
              </label>
              <input
                type="text"
                value={chantPhrase}
                onChange={(e) => setChantPhrase(e.target.value.toUpperCase())}
                placeholder="E.g. JAI SHREE RADHA KRISHNA"
                className="w-full p-2.5 bg-[#120406] border border-yellow-500/50 rounded-xl text-xs font-black text-yellow-300 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMantraPicker(false)}
              className="w-full py-2.5 bg-yellow-400 text-stone-950 font-black text-xs rounded-xl"
            >
              Select Mantra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
