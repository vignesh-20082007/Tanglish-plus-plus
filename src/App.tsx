import { useState, useRef, useCallback } from 'react';
import { FileCode, Terminal as TerminalIcon, Rows2, Wand2 } from 'lucide-react';
import { Header } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { formatTanglishCode } from './utils/formatCode';
import { Terminal } from './components/Terminal';
import { InputModal } from './components/InputModal';
import { DocsSidebar } from './components/DocsSidebar';
import { TEMPLATES, CodeTemplate } from './templates';
import { runTanglishCode } from './interpreter';

export function App() {
  const [currentTemplate, setCurrentTemplate] = useState<CodeTemplate>(TEMPLATES[0]);
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [docsOpen, setDocsOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'split' | 'stacked'>('split');
  const [mobileTab, setMobileTab] = useState<'editor' | 'terminal' | 'split'>('editor');

  // Input Modal state
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const inputResolverRef = useRef<((value: string) => void) | null>(null);

  // Cancellation ref
  const isCancelledRef = useRef(false);

  // Print callback to update terminal output in real-time
  const handlePrint = useCallback((text: string) => {
    setOutput(prev => [...prev, text]);
  }, []);

  // Request input callback triggered by kelu()
  const handleRequestInput = useCallback((promptText: string): Promise<string> => {
    setInputPrompt(promptText);
    setInputModalOpen(true);
    return new Promise(resolve => {
      inputResolverRef.current = resolve;
    });
  }, []);

  const handleInputSubmit = (value: string) => {
    setInputModalOpen(false);
    // Echo input back into terminal like a real CLI
    setOutput(prev => [...prev, `${inputPrompt} ${value}\n`]);
    if (inputResolverRef.current) {
      inputResolverRef.current(value);
      inputResolverRef.current = null;
    }
  };

  const handleInputCancel = () => {
    setInputModalOpen(false);
    if (inputResolverRef.current) {
      inputResolverRef.current('');
      inputResolverRef.current = null;
    }
  };

  // Run code
  const handleRun = async () => {
    if (isRunning) return;

    // If on mobile editor tab, switch to terminal view so user sees execution immediately
    if (typeof window !== 'undefined' && window.innerWidth < 768 && mobileTab === 'editor') {
      setMobileTab('terminal');
    }

    // Auto-fix any manual unindented block/loop code
    const rawCode = code ?? currentTemplate.code;
    const formattedCode = formatTanglishCode(rawCode);
    if (formattedCode !== code) {
      setCode(formattedCode);
    }

    setIsRunning(true);
    setHasError(false);
    setExecutionTimeMs(null);
    isCancelledRef.current = false;

    // Terminal header banner
    setOutput([
      `\x1b[36m>>> Iyakku (Executing): main.tpp...\x1b[0m\n\n`,
    ]);

    const result = await runTanglishCode({
      source: formattedCode,
      onPrint: handlePrint,
      onRequestInput: handleRequestInput,
      isCancelled: () => isCancelledRef.current,
    });

    setIsRunning(false);
    setExecutionTimeMs(result.executionTimeMs);
    setHasError(!result.success);

    if (result.success) {
      setOutput(prev => [
        ...prev,
        `\n\x1b[32m[Program finished successfully in ${result.executionTimeMs}ms]\x1b[0m\n`,
      ]);
    }
  };

  // Stop code execution
  const handleStop = () => {
    isCancelledRef.current = true;
    setIsRunning(false);
    if (inputResolverRef.current) {
      inputResolverRef.current('');
      inputResolverRef.current = null;
    }
    setInputModalOpen(false);
    setOutput(prev => [
      ...prev,
      `\n\x1b[33m[Execution halted by user (Niruthiyachu)]\x1b[0m\n`,
    ]);
  };

  const handleSelectTemplate = (template: CodeTemplate) => {
    setCurrentTemplate(template);
    setCode(template.code);
    setOutput([]);
    setHasError(false);
    setExecutionTimeMs(null);
  };

  const handleResetCode = () => {
    setCode(currentTemplate.code || TEMPLATES[0].code);
  };

  const handleInsertSnippet = (snippet: string) => {
    setCode(prev => prev + '\n\n' + snippet);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileTab('editor');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090E] text-slate-100">
      {/* Action Header */}
      <Header
        onRun={handleRun}
        onStop={handleStop}
        isRunning={isRunning}
        selectedTemplateId={currentTemplate.id}
        onSelectTemplate={handleSelectTemplate}
        onToggleDocs={() => setDocsOpen(prev => !prev)}
        docsOpen={docsOpen}
        fontSize={fontSize}
        onIncreaseFontSize={() => setFontSize(f => Math.min(22, f + 1))}
        onDecreaseFontSize={() => setFontSize(f => Math.max(11, f - 1))}
        onResetCode={handleResetCode}
        layoutMode={layoutMode}
        onToggleLayout={() => setLayoutMode(m => (m === 'split' ? 'stacked' : 'split'))}
      />

      {/* Mobile Mode Sub-Navbar: Tabs & Quick Actions (< md screens) */}
      <div className="flex md:hidden items-center justify-between px-2.5 py-1.5 bg-[#0B1120] border-b border-slate-800 select-none shrink-0 gap-2">
        {/* View Switcher: Code / Terminal / Split */}
        <div className="flex items-center gap-1 bg-[#050811] p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
              mobileTab === 'editor'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Code</span>
          </button>

          <button
            onClick={() => setMobileTab('terminal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all relative ${
              mobileTab === 'terminal'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Output</span>
            {isRunning ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5"></span>
            ) : hasError ? (
              <span className="w-2 h-2 rounded-full bg-rose-400 ml-0.5"></span>
            ) : output.length > 0 ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5"></span>
            ) : null}
          </button>

          <button
            onClick={() => setMobileTab('split')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono transition-all ${
              mobileTab === 'split'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Split (Stacked) View"
          >
            <Rows2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Split</span>
          </button>
        </div>

        {/* Mobile Format / Indent Quick Action */}
        <button
          onClick={() => {
            const formatted = formatTanglishCode(code);
            if (formatted !== code) setCode(formatted);
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#050811] hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 text-xs font-mono transition-colors shrink-0"
          title="Auto-Fix 4-Space Indentation"
        >
          <Wand2 className="w-3 h-3 text-amber-400" />
          <span>Fix Indent</span>
        </button>
      </div>

      {/* Main IDE Workspace */}
      <main
        className={`flex-1 p-1.5 sm:p-3 min-h-0 ${
          layoutMode === 'split'
            ? 'flex flex-col md:flex-row gap-2 sm:gap-3 overflow-hidden'
            : 'flex flex-col gap-2 sm:gap-3 overflow-y-auto'
        }`}
      >
        {/* Code Editor Section */}
        <section
          className={`min-h-0 ${
            // Mobile tab visibility
            mobileTab === 'editor'
              ? 'flex flex-col flex-1 h-full'
              : mobileTab === 'split'
              ? 'flex flex-col h-1/2 flex-1'
              : 'hidden md:flex md:flex-col'
          } ${
            // Desktop layout
            layoutMode === 'split'
              ? 'md:w-[55%] md:h-full'
              : 'md:w-full md:h-[52%] md:min-h-[260px]'
          }`}
        >
          <CodeEditor
            value={code}
            onChange={setCode}
            fontSize={fontSize}
            onResetCode={handleResetCode}
          />
        </section>

        {/* Output Terminal Section */}
        <section
          className={`min-h-0 ${
            // Mobile tab visibility
            mobileTab === 'terminal'
              ? 'flex flex-col flex-1 h-full'
              : mobileTab === 'split'
              ? 'flex flex-col h-1/2 flex-1'
              : 'hidden md:flex md:flex-col'
          } ${
            // Desktop layout
            layoutMode === 'split'
              ? 'md:w-[45%] md:h-full'
              : 'md:w-full md:h-[48%] md:min-h-[240px]'
          }`}
        >
          <Terminal
            output={output}
            isRunning={isRunning}
            executionTimeMs={executionTimeMs}
            hasError={hasError}
            onClear={() => setOutput([])}
            onReRun={handleRun}
          />
        </section>
      </main>

      {/* Interactive Modal for kelu() */}
      <InputModal
        isOpen={inputModalOpen}
        promptText={inputPrompt}
        onSubmit={handleInputSubmit}
        onCancel={handleInputCancel}
      />

      {/* Documentation Drawer */}
      <DocsSidebar
        isOpen={docsOpen}
        onClose={() => setDocsOpen(false)}
        onInsertSnippet={handleInsertSnippet}
      />
    </div>
  );
}

export default App;
