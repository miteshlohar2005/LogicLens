"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/store/canvasStore";

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScanModal({ isOpen, onClose }: ScanModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<"init" | "preview" | "captured">("init");
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setSketchImageBase64 = useCanvasStore((s) => s.setSketchImageBase64);
  const setScanState = useCanvasStore((s) => s.setScanState);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase("preview");
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : "Could not access camera. Make sure no other app is using it."
      );
    }
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedDataUrl(canvas.toDataURL("image/png", 0.95));
    setPhase("captured");
    stopStream();
  }, [stopStream]);

  const confirmCapture = useCallback(() => {
    if (!capturedDataUrl) return;
    setSketchImageBase64(capturedDataUrl.split(",")[1]);
    setScanState("captured");
    onClose();
  }, [capturedDataUrl, setSketchImageBase64, setScanState, onClose]);

  const retake = useCallback(async () => {
    setCapturedDataUrl(null);
    setPhase("init");
    await startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setPhase("init");
      setCapturedDataUrl(null);
      setError(null);
    }
  }, [isOpen, stopStream]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSketchImageBase64(result.split(",")[1]);
      setScanState("captured");
      onClose();
    };
    reader.readAsDataURL(file);
  }, [setSketchImageBase64, setScanState, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#000000bb]"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white w-full max-w-lg pointer-events-auto border-[4px] border-black shadow-[8px_8px_0_0_#000] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-[4px] border-black bg-[#E5E5E5]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black flex items-center justify-center text-white border-2 border-black">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                      <path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-black text-lg font-black uppercase tracking-tight">Scan Sketch</p>
                  </div>
                </div>
                <button onClick={onClose} className="btn-icon bg-[#EF476F] hover:bg-[#FFD166]" aria-label="Close">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 bg-[#FFFDF8]">
                {error && (
                  <div className="mb-6 p-4 bg-[#EF476F] border-4 border-black text-white font-bold">{error}</div>
                )}

                {phase === "init" && !error && (
                  <div className="flex flex-col gap-4">
                    <button id="scan-modal-webcam-btn" onClick={startCamera} className="brutal-btn w-full justify-center py-4 bg-[#06D6A0] text-lg">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="0" ry="0" /></svg>
                      Open Webcam
                    </button>
                    <div className="relative flex items-center py-2">
                      <div className="flex-1 h-[2px] bg-black" />
                      <span className="mx-4 text-black font-black uppercase">or</span>
                      <div className="flex-1 h-[2px] bg-black" />
                    </div>
                    <label htmlFor="scan-modal-file-input" className="brutal-btn-ghost w-full justify-center py-4 cursor-pointer text-lg bg-[#FFD166] border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-y-1 hover:translate-x-1">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      Upload Photo
                      <input id="scan-modal-file-input" type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} />
                    </label>
                  </div>
                )}

                {phase === "preview" && (
                  <div className="flex flex-col gap-4">
                    <div className="relative border-4 border-black bg-black aspect-video overflow-hidden">
                      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                      <div className="absolute inset-4 border-4 border-[#06D6A0] pointer-events-none">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-black -translate-x-1 -translate-y-1" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-black translate-x-1 -translate-y-1" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-black -translate-x-1 translate-y-1" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-black translate-x-1 translate-y-1" />
                      </div>
                    </div>
                    <button id="scan-modal-capture-btn" onClick={captureFrame} className="brutal-btn w-full justify-center py-4 bg-[#EF476F] text-white text-lg">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /></svg>
                      Capture
                    </button>
                  </div>
                )}

                {phase === "captured" && capturedDataUrl && (
                  <div className="flex flex-col gap-4">
                    <div className="border-4 border-black bg-black aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={capturedDataUrl} alt="Captured sketch" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex gap-4">
                      <button onClick={retake} className="brutal-btn-ghost flex-1 justify-center py-4 border-4 bg-[#E5E5E5] text-lg">Retake</button>
                      <button id="scan-modal-confirm-btn" onClick={confirmCapture} className="brutal-btn flex-1 justify-center py-4 bg-[#06D6A0] text-lg">Use Image</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </AnimatePresence>
  );
}
