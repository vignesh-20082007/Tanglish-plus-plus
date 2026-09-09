import { useState, useRef, useCallback } from 'react';
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

      {/* Main IDE Workspace */}
      <main
        className={`flex-1 p-2 sm:p-3 min-h-0 ${
          layoutMode === 'split'
            ? 'flex flex-col md:flex-row gap-2.5 sm:gap-3 overflow-hidden'
            : 'flex flex-col gap-2.5 sm:gap-3 overflow-y-auto'
        }`}
      >
        {/* Left: Code Editor */}
        <section
          className={`flex flex-col min-h-0 ${
            layoutMode === 'split'
              ? 'flex-1 md:w-[55%] h-1/2 md:h-full'
              : 'w-full h-[52%] min-h-[260px]'
          }`}
        >
          <CodeEditor
            value={code}
            onChange={setCode}
            fontSize={fontSize}
            onResetCode={handleResetCode}
          />
        </section>

        {/* Right: Output Terminal */}
        <section
          className={`flex flex-col min-h-0 ${
            layoutMode === 'split'
              ? 'flex-1 md:w-[45%] h-1/2 md:h-full'
              : 'w-full h-[48%] min-h-[240px]'
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
