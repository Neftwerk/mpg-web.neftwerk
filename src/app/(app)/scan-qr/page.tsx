"use client";

import { useState, useEffect, useRef } from "react";
import { MobileTopBar, MobileMenu } from "@/components/sidebar/Sidebar";

export default function ScanQRPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraError, setHasCameraError] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasCameraError(true);
      }
    }
    setupCamera();

    return () => {
      // Cleanup camera stream on unmount
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      <MobileTopBar title="Scan QR" onMenuOpen={() => setMenuOpen(true)} />

      {/* Desktop header */}
      <header className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-4 mt-20 lg:mt-0">
        <h1 className="text-xl font-semibold text-slate-900">Scan QR</h1>
      </header>

      <div className="flex flex-col items-center justify-center p-6 mt-20 lg:mt-10 min-h-[calc(100vh-100px)]">
        
        {/* Scanner Container */}
        <div className="relative mt-8 mb-20 w-[280px] h-[280px]">
          
          {/* Corner Brackets */}
          <div className="absolute -top-6 -left-6 w-16 h-16 border-t-[1.5px] border-l-[1.5px] border-[#8a9b9e]/70 rounded-tl-[20px]" />
          <div className="absolute -top-6 -right-6 w-16 h-16 border-t-[1.5px] border-r-[1.5px] border-[#8a9b9e]/70 rounded-tr-[20px]" />
          <div className="absolute -bottom-6 -left-6 w-16 h-16 border-b-[1.5px] border-l-[1.5px] border-[#8a9b9e]/70 rounded-bl-[20px]" />
          <div className="absolute -bottom-6 -right-6 w-16 h-16 border-b-[1.5px] border-r-[1.5px] border-[#8a9b9e]/70 rounded-br-[20px]" />

          {/* Circle Cutout / Camera View */}
          <div className="w-full h-full rounded-full border-[6px] border-[#7d8c8e] overflow-hidden bg-white/50 shadow-inner relative flex items-center justify-center z-10">
            {hasCameraError ? (
              <p className="text-sm text-center text-slate-500 px-4">
                Camera access denied or unavailable.
              </p>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="btn-neumorph w-[220px]"
          onClick={() => {
            alert("QR Code scanner action triggered.");
          }}
        >
          Scan QR
        </button>

      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
