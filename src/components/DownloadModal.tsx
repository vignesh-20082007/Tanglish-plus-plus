import React, { useEffect, useState } from 'react';
import {
  Download,
  Monitor,
  Smartphone,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  HardDrive,
  Laptop,
  FileDown,
  Info,
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'windows' | 'android' | 'other'>('windows');

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('android')) {
        setPlatform('android');
      } else if (ua.includes('win')) {
        setPlatform('windows');
      } else {
        setPlatform('other');
      }
    }
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerDownload = (fileName: string) => {
    setDownloadedItem(fileName);
    setTimeout(() => setDownloadedItem(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#080D1A] border border-slate-700/90 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Glowing Gradient Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 pb-3 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Download className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white font-mono flex items-center gap-1.5">
                  Download Tanglish++ IDE
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                  <Sparkles className="w-2.5 h-2.5" /> v1.0 Native
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Download the standalone app for <span className="text-cyan-300 font-semibold">Windows</span> &{' '}
                <span className="text-emerald-300 font-semibold">Android</span>. Fast, offline-first execution.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Platform Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Windows Desktop Card */}
            <div
              className={`relative rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all border ${
                platform === 'windows'
                  ? 'bg-gradient-to-b from-cyan-950/30 via-[#0B1224] to-[#070B14] border-cyan-500/50 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/20'
                  : 'bg-[#0B1224] border-slate-800 hover:border-slate-700'
              }`}
            >
              {platform === 'windows' && (
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500 text-slate-950 rounded-full shadow-md shadow-cyan-500/30">
                  Detected Device
                </span>
              )}

              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                      Windows Desktop
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Windows 10 / 11 • 64-bit</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  Full standalone desktop IDE. No browser tabs, instant startup, and full offline interpreter support.
                </p>

                <ul className="text-[11px] text-slate-400 space-y-1.5 mb-4 font-mono">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Zero install portable option</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Frameless dark IDE UI</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Includes all 24 standard libraries</span>
                  </li>
                </ul>
              </div>

              {/* Windows Download Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <a
                  href="./downloads/Tanglish-IDE-Portable.exe"
                  download="Tanglish-IDE-Portable.exe"
                  onClick={() => triggerDownload('Tanglish-IDE-Portable.exe')}
                  className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 transition-all shadow-md shadow-cyan-500/25 group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FileDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                    <span>Portable (.exe)</span>
                    <span className="text-[10px] opacity-80 px-1 py-0.2 bg-slate-950/15 rounded">Quick Run</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-800">119.9 MB</span>
                </a>

                <a
                  href="./downloads/Tanglish-IDE-Setup.exe"
                  download="Tanglish-IDE-Setup.exe"
                  onClick={() => triggerDownload('Tanglish-IDE-Setup.exe')}
                  className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-mono text-slate-200 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
                    <span>Setup Installer (.exe)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">120.3 MB</span>
                </a>
              </div>
            </div>

            {/* Android Mobile Card */}
            <div
              className={`relative rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all border ${
                platform === 'android'
                  ? 'bg-gradient-to-b from-emerald-950/30 via-[#0B1224] to-[#070B14] border-emerald-500/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/20'
                  : 'bg-[#0B1224] border-slate-800 hover:border-slate-700'
              }`}
            >
              {platform === 'android' && (
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 rounded-full shadow-md shadow-emerald-500/30">
                  Detected Device
                </span>
              )}

              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                      Android Mobile
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Android 7.0+ • APK Package</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  Code in Tanglish++ on your phone or tablet. Responsive touch controls, mobile terminal, and full offline interpreter.
                </p>

                <ul className="text-[11px] text-slate-400 space-y-1.5 mb-4 font-mono">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Ultra-compact package (6.4 MB)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Optimized for smartphones & tablets</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Zero data or internet needed</span>
                  </li>
                </ul>
              </div>

              {/* Android Download Button */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <a
                  href="./downloads/Tanglish-IDE.apk"
                  download="Tanglish-IDE.apk"
                  onClick={() => triggerDownload('Tanglish-IDE.apk')}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 transition-all shadow-md shadow-emerald-500/25 group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FileDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                    <span>Download APK (.apk)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-800">6.4 MB</span>
                </a>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono px-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Tested & verified installable package</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Installation Tips Alert */}
          <div className="bg-[#0D152A] border border-slate-800 rounded-xl p-3 sm:p-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-mono font-semibold text-cyan-300 mb-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Quick Installation Tips</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <p>
                <strong className="text-slate-200">Windows:</strong> For portable `.exe`, just double-click to launch. If SmartScreen shows "Windows protected your PC", click <span className="text-cyan-300 underline">More info</span> &rarr; <span className="text-cyan-300 underline">Run anyway</span>.
              </p>
              <p>
                <strong className="text-slate-200">Android:</strong> After downloading the `.apk`, open it from Downloads. If prompted, allow "Install unknown apps" in Android settings.
              </p>
            </div>
          </div>

          {/* Success Toast when download is clicked */}
          {downloadedItem && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-mono animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Download started for <strong className="text-white">{downloadedItem}</strong>. Check your browser downloads folder!
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-[#050811] border-t border-slate-800/80 text-[11px] font-mono text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Tanglish++ (T++) Web, Desktop & Mobile</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
