import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraScannerProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
  title: string;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser context.');
      }

      // Primary attempt: High-quality environment camera
      const primaryConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      let newStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
      } catch (e) {
        console.warn('Environment camera failed, trying fallback constraints...');
        // Fallback: Any video device
        newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsInitializing(false);
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      let errorMsg = 'Could not access camera. Please ensure you have given permission.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission denied. If you are in a preview window, try opening the app in a new tab to grant permissions manually.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found on this device.';
      }
      setError(errorMsg);
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
          onClose();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white backdrop-blur-md">
          <X size={24} />
        </button>
        <h3 className="text-white font-bold tracking-tight text-sm uppercase">{title}</h3>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {isInitializing && (
          <div className="flex flex-col items-center gap-4 text-white">
            <RefreshCw className="animate-spin text-yellow-500" size={40} />
            <p className="text-sm font-medium animate-pulse">Initializing Lens...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-white space-y-4">
            <p className="text-red-400 font-bold">{error}</p>
            <button 
              onClick={startCamera}
              className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-xl"
            >
              Try Again
            </button>
          </div>
        )}

        {!isInitializing && !error && (
          <>
            <div className="relative w-full max-w-[90vw] aspect-[3/4] md:aspect-[4/3] max-h-[70vh] overflow-hidden rounded-[32px] border-2 border-white/10 shadow-2xl">
              {capturedImage ? (
                <img src={capturedImage} className="w-full h-full object-cover" alt="Captured"  loading="lazy" />
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {/* ID FRAME OVERLAY */}
              {!capturedImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative w-[85%] aspect-[1.58/1] border-2 border-white/40 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                    {/* Corners */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-yellow-500 rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-yellow-500 rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-yellow-500 rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-yellow-500 rounded-br-xl" />
                    
                    {/* Scanning Line Animation */}
                    <motion.div 
                      animate={{ top: ['10%', '90%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-[5%] right-[5%] h-0.5 bg-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.8)] z-10"
                    />
                  </div>
                  <p className="mt-8 text-white/80 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
                    Align ID within frame
                  </p>
                </div>
              )}
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-8 px-6">
              {capturedImage ? (
                <>
                  <button 
                    onClick={handleRetake}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10 group-active:scale-90 transition-all">
                      <RefreshCw size={28} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Retake</span>
                  </button>
                  
                  <button 
                    onClick={handleConfirm}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center text-black shadow-lg shadow-yellow-500/20 group-active:scale-95 transition-all">
                      <Check size={40} strokeWidth={3} />
                    </div>
                    <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Confirm & Save</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={capturePhoto}
                  className="relative group flex items-center justify-center"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group-active:scale-90 transition-all">
                    <div className="w-16 h-16 rounded-full bg-white shadow-xl" />
                  </div>
                  <div className="absolute -top-12 px-4 py-2 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                    Tap to Capture
                  </div>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};

export default CameraScanner;
