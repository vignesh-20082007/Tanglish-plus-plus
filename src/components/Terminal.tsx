import React, { useEffect, useRef, useState } from 'react';
import {
  Terminal as TerminalIcon,
  Trash2,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface TerminalProps {
  output: string[];
  isRunning: boolean;
  executionTimeMs?: number | null;
  hasError: boolean;
  onClear: () => void;
  onReRun?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  output,
  isRunning,
  executionTimeMs,
  hasError,
  onClear,
  onReRun,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, autoScroll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output.join(''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#050811] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 min-h-[300px]">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0B1120] border-b border-slate-800 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block border border-red-400/40"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-400/40"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-400/40"></span>
          </div>
          <div className="h-4 w-px bg-slate-800 mx-1"></div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">t++ terminal</span>
            <span className="text-slate-500 text-[11px]">~/workspace</span>
          </div>
        </div>

        {/* Action badges and buttons */}
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          {isRunning ? (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 animate-pulse">
              <Play className="w-3 h-3 fill-amber-300" />
              <span>Running...</span>
            </span>
          ) : hasError ? (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
              <AlertCircle className="w-3 h-3" />
              <span>Thavaru (Error)</span>
            </span>
          ) : output.length > 0 ? (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>Mudinthathu (Success)</span>
            </span>
          ) : null}

          {executionTimeMs !== null && executionTimeMs !== undefined && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{executionTimeMs}ms</span>
            </span>
          )}

          {/* Re-run button */}
          {onReRun && (
            <button
              onClick={onReRun}
              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
              title="Run Code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Copy Terminal Output"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Clear button */}
          <button
            onClick={onClear}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Screen Body */}
      <div
        className="flex-1 p-4 font-mono-code text-[13px] leading-relaxed overflow-y-auto select-text bg-[#030712] text-emerald-400 selection:bg-emerald-900/60 selection:text-emerald-200"
        style={{ textShadow: '0 0 1px rgba(74, 222, 128, 0.4)' }}
      >
        {/* Startup Prompt */}
        <div className="text-slate-500 mb-3 select-none flex items-center gap-2 text-xs border-b border-slate-900 pb-2">
          <span className="text-emerald-500 font-bold">$</span>
          <span>tanglish++ v1.0.0 (Tamil-English Interactive Environment)</span>
        </div>

        {output.length === 0 && !isRunning && (
          <div className="text-slate-600 italic py-8 text-center select-none">
            <p>Terminal output empty-aa irukku.</p>
            <p className="text-xs mt-1 text-slate-700">Press the green &quot;RUN (IYAKKU)&quot; button to execute your Tanglish++ code.</p>
          </div>
        )}

        {/* Output lines */}
        <div className="space-y-0.5 whitespace-pre-wrap break-words">
          {output.map((chunk, idx) => {
            const isError =
              chunk.includes('Error') ||
              chunk.includes('error') ||
              chunk.includes('Thavaru') ||
              chunk.includes('\x1b[31m');

            // Clean ANSI codes if present
            const cleanText = chunk.replace(/\x1b\[[0-9;]*m/g, '');

            return (
              <span
                key={idx}
                className={isError ? 'text-rose-400 font-medium' : 'text-[#4ADE80]'}
              >
                {cleanText}
              </span>
            );
          })}
        </div>

        {/* Blinking Cursor while running */}
        {isRunning && (
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs mt-2">
            <span className="w-2.5 h-4 bg-amber-400 animate-pulse inline-block"></span>
            <span className="italic text-slate-400 text-xs">tanglish-vm executing...</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer Bar */}
      <div className="px-4 py-1.5 bg-[#0B1120] border-t border-slate-900/90 text-[11px] font-mono text-slate-500 flex items-center justify-between select-none">
        <span>Output Encoding: UTF-8 (Tamil + Tanglish)</span>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={e => setAutoScroll(e.target.checked)}
            className="w-3 h-3 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
          />
          <span>Auto-scroll</span>
        </label>
      </div>
    </div>
  );
};
