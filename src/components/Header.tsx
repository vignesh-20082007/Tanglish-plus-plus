import React from 'react';
import {
  Play,
  Square,
  BookOpen,
  FolderKanban,
  RotateCcw,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Columns2,
  Rows2,
} from 'lucide-react';
import { TEMPLATES, CodeTemplate } from '../templates';

interface HeaderProps {
  onRun: () => void;
  onStop: () => void;
  isRunning: boolean;
  selectedTemplateId: string;
  onSelectTemplate: (template: CodeTemplate) => void;
  onToggleDocs: () => void;
  docsOpen: boolean;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onResetCode: () => void;
  layoutMode?: 'split' | 'stacked';
  onToggleLayout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRun,
  onStop,
  isRunning,
  selectedTemplateId,
  onSelectTemplate,
  onToggleDocs,
  docsOpen,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onResetCode,
  layoutMode = 'split',
  onToggleLayout,
}) => {
  return (
    <header className="bg-[#0B1120] border-b border-slate-800 px-3 py-2 select-none shrink-0">
      <div className="flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
        {/* Left: Branding & Official Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative group">
            <img
              src="/tanglish-logo.png"
              alt="Tanglish++ Logo"
              className="w-9 h-9 rounded-xl shadow-lg shadow-cyan-900/40 ring-1 ring-cyan-400/30 object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0B1120]"></div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1 font-mono">
                <span>Tanglish</span>
                <span className="text-amber-400">++</span>
                <span className="text-emerald-400 text-[10px] sm:text-xs px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/30">
                  IDE
                </span>
              </h1>
              <span className="text-[10px] font-mono text-slate-500 hidden xl:inline">
                v1.0.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans hidden 2xl:block">
              தமிழ்-English Pythonic Programming Language
            </p>
          </div>
        </div>

        {/* Center: Template Selector, Reset & Big Green RUN Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Template Selector Dropdown */}
          <div className="relative flex items-center">
            <select
              value={selectedTemplateId}
              onChange={e => {
                const found = TEMPLATES.find(t => t.id === e.target.value);
                if (found) onSelectTemplate(found);
              }}
              className="appearance-none bg-[#070B14] hover:bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-8 py-1.5 sm:py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 cursor-pointer transition-all max-w-[170px] sm:max-w-[240px] md:max-w-[280px] truncate"
            >
              {TEMPLATES.map(tmpl => (
                <option key={tmpl.id} value={tmpl.id} className="bg-[#0D1322] text-slate-200">
                  {tmpl.name}
                </option>
              ))}
            </select>
            <FolderKanban className="absolute left-2.5 w-3.5 h-3.5 text-amber-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Reset Code Button */}
          <button
            onClick={onResetCode}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:py-2 text-xs font-mono text-slate-300 hover:text-white bg-[#070B14] hover:bg-slate-800 rounded-xl transition-colors border border-slate-700/80 hover:border-slate-600"
            title="Reset / Reload Selected Template Code"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Primary RUN / STOP Button (Never hidden, always prominent) */}
          {isRunning ? (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-4 py-1.5 sm:py-2 text-xs font-bold font-mono tracking-wide text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer animate-pulse shrink-0"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>STOP</span>
            </button>
          ) : (
            <button
              onClick={onRun}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-bold font-mono tracking-wide text-slate-950 bg-[#10B981] hover:bg-[#059669] hover:text-white active:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN (IYAKKU)</span>
            </button>
          )}
        </div>

        {/* Right: Layout Toggle, Font Size & Documentation Drawer */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Screen Layout Mode Toggle (Split side-by-side vs Stacked top-bottom) */}
          {onToggleLayout && (
            <button
              onClick={onToggleLayout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 text-xs font-mono bg-[#070B14] text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-colors"
              title={layoutMode === 'split' ? 'Switch to Stacked View' : 'Switch to Split Side-by-Side View'}
            >
              {layoutMode === 'split' ? (
                <>
                  <Columns2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline text-[11px]">Side-by-Side</span>
                </>
              ) : (
                <>
                  <Rows2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline text-[11px]">Stacked</span>
                </>
              )}
            </button>
          )}

          {/* Font size adjustments */}
          <div className="hidden xl:flex items-center gap-1 bg-[#070B14] border border-slate-800 rounded-lg p-0.5 text-slate-400 text-xs font-mono">
            <button
              onClick={onDecreaseFontSize}
              className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] text-slate-500">{fontSize}px</span>
            <button
              onClick={onIncreaseFontSize}
              className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Documentation Drawer Button */}
          <button
            onClick={onToggleDocs}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-mono rounded-xl border transition-all ${
              docsOpen
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#070B14] text-slate-300 hover:text-amber-400 border-slate-700/80 hover:border-amber-500/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Docs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
