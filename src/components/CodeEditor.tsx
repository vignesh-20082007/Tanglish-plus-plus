import React, { useMemo, useState, useCallback } from 'react';
import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { StreamLanguage, HighlightStyle, syntaxHighlighting, indentUnit, indentService } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { Prec } from '@codemirror/state';
import { Copy, Check, Sparkles, FileCode, RotateCcw, Wand2 } from 'lucide-react';
import { formatTanglishCode } from '../utils/formatCode';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  fontSize?: number;
  onResetCode?: () => void;
}

// Tanglish++ Keywords (Orange #FF9800)
const TANGLISH_KEYWORDS = new Set([
  'sollu',
  'kelu',
  'iruntha',
  'illatti',
  'illana',
  'varisaiya',
  'kaaga',
  'ulla',
  'kulla',
  'irukkura_varai',
  'fun',
  'seyal',
  'thirupikudu',
  'kutti_fun',
  'class',
  'ithu',
  'muyarchi',
  'thavaru',
  'kandippa',
  'ulagam',
  'matrum',
  'alladhu',
  'illai',
  'unmai',
  'poi',
  'onnumilla',
  'None',
  'import',
  'eduthu_vaa',
  'kondu_va',
  'niruva',
  'thodaru',
  'pass',
  'del',
  'azhi',

  // 24 Extended Standard Libraries (Orange #FF9800)
  'kettuko',
  'thodarbu',
  'anjal',
  'html',
  'xml',
  'csv',
  'sqlite3',
  'semipu',
  'vagaigal',
  'copy',
  'medai',
  'thunai',
  'poottu',
  'ragasiyam',
  'maatri',
  'adaiyalam',
  'kattu',
  'pathivu',
  'sodhanai',
  'nagarvu',
  'naalkati',
  'thadam',
  'parisodhanai',
  'kattalai',
  'neram',
  'ilai',
]);

// Tanglish++ Builtins (Neon Cyan #00E5FF)
const TANGLISH_BUILTINS = new Set([
  'ganitham',
  'random',
  'neramkaalam',
  'os',
  'json',
  'kanakkeduppu',
  'sys',
  'int',
  'float',
  'string',
  'alavu',
  'len',
  'capitalize',
  'centre',
  'center',
  'find',
  'isalnum',
  'isalpha',
  'isdigit',
  'lower',
  'islower',
  'isupper',
  'upper',
  'title',
  'swapcase',
  'count',
  'vagai',
  'chr',
  'ord',
  'range',
  'append',
  'extend',
  'pop',
  'insert',
  'remove',
  'clear',
  'index',
  'reverse',
  'sort',
  'max',
  'min',
  'sum',
  'keys',
  'values',
  'items',
  'mean',
  'median',
  'mode',
  'sqrt',
  'pow',
  'abs',
  'randint',
  'thoongu',
  'ippozhuthu',
  'thethi',
  'mkdir',
  'listdir',
  'exists',
]);

// Custom CodeMirror StreamLanguage parser for Tanglish++ with built-in auto-indent
const tanglishLanguage = StreamLanguage.define({
  name: 'tanglish',
  startState() {
    return { inTripleQuote: null as string | null };
  },
  token(stream, state) {
    // Multi-line triple quotes
    if (state.inTripleQuote) {
      const quote = state.inTripleQuote;
      while (!stream.eol()) {
        if (stream.match(quote)) {
          state.inTripleQuote = null;
          break;
        }
        stream.next();
      }
      return 'string';
    }

    if (stream.eatSpace()) return null;

    // Single-line comments (# ...)
    if (stream.match('#')) {
      stream.skipToEnd();
      return 'comment';
    }

    // Triple-quoted strings
    if (stream.match('"""') || stream.match("'''")) {
      const quote = stream.current();
      state.inTripleQuote = quote;
      while (!stream.eol()) {
        if (stream.match(quote)) {
          state.inTripleQuote = null;
          break;
        }
        stream.next();
      }
      return 'string';
    }

    // Standard strings
    if (stream.match('"') || stream.match("'")) {
      const quote = stream.current();
      let escaped = false;
      while (!stream.eol()) {
        const ch = stream.next();
        if (ch === quote && !escaped) break;
        escaped = !escaped && ch === '\\';
      }
      return 'string';
    }

    // Numbers (integers & floats)
    if (stream.match(/^-?\d+(\.\d+)?/)) {
      return 'number';
    }

    // Multi-character operators
    if (
      stream.match('**') ||
      stream.match('//') ||
      stream.match('==') ||
      stream.match('!=') ||
      stream.match('<=') ||
      stream.match('>=') ||
      stream.match('+=') ||
      stream.match('-=') ||
      stream.match('*=') ||
      stream.match('/=')
    ) {
      return 'operator';
    }

    // Single-character operators & delimiters
    if (stream.match(/^[-+*/%=<>:]/)) {
      return 'operator';
    }

    // Words (keywords, builtins, identifiers)
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const word = stream.current();
      if (TANGLISH_KEYWORDS.has(word)) {
        return 'keyword';
      }
      if (TANGLISH_BUILTINS.has(word)) {
        return 'atom';
      }
      return 'variableName';
    }

    stream.next();
    return null;
  },
  // Auto-indentation for block statements ending with ':'
  indent(_state, _textAfter, cx) {
    const head = cx.state.selection.main.head;
    const line = cx.state.doc.lineAt(head);
    if (line.number > 1) {
      const prevLine = cx.state.doc.line(line.number - 1);
      const trimmed = prevLine.text.trim();
      if (trimmed.endsWith(':')) {
        const match = prevLine.text.match(/^[ \t]*/);
        return (match ? match[0].length : 0) + 4;
      }
    }
    return null;
  },
});

// Custom HighlightStyle matching Tanglish++ theme - Crystal Clear, High Contrast, Zero Blur
const tanglishHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#FF9800', fontWeight: '700' },     // Vivid Tanglish Orange
  { tag: t.string, color: '#4ADE80', fontWeight: '600' },       // Crisp Neon Emerald Green
  { tag: t.number, color: '#D8B4FE', fontWeight: '600' },       // High-contrast Bright Lavender
  { tag: t.comment, color: '#94A3B8', fontStyle: 'italic' },    // Crisp Readable Silver
  { tag: t.atom, color: '#00E5FF', fontWeight: '700' },         // Razor-sharp Neon Cyan
  { tag: t.operator, color: '#FB7185', fontWeight: '700' },     // Vivid Pink-Rose
  { tag: t.variableName, color: '#FFFFFF', fontWeight: '500' }, // Pure Solid White (No grey haze)
  { tag: t.propertyName, color: '#93C5FD', fontWeight: '600' }, // Crisp Sky Blue
]);

// Auto-indent service to ensure all new lines after a colon receive +4 spaces
const autoIndentService = indentService.of((context, pos) => {
  const line = context.state.doc.lineAt(pos);
  if (line.number > 1) {
    const prevLine = context.state.doc.line(line.number - 1);
    const trimmed = prevLine.text.trim();
    if (trimmed.endsWith(':')) {
      const match = prevLine.text.match(/^[ \t]*/);
      const prevIndent = match ? match[0].length : 0;
      return prevIndent + 4;
    }
    const match = prevLine.text.match(/^[ \t]*/);
    if (match && match[0].length > 0) {
      return match[0].length;
    }
  }
  return null;
});

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  fontSize = 15,
  onResetCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [formatted, setFormatted] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // CodeMirror theme customization: Pitch Black, High-Contrast, Zero-Blur, Crisp Fonts
  const customTheme = useMemo(() => {
    return EditorView.theme(
      {
        '&': {
          height: '100%',
          backgroundColor: '#030712',
          color: '#FFFFFF',
          fontSize: `${fontSize}px`,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontWeight: '500',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        },
        '.cm-scroller': {
          overflow: 'auto',
          lineHeight: '1.7',
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        },
        '.cm-content': {
          padding: '12px 0',
          caretColor: '#10B981',
          backgroundColor: '#030712',
        },
        '.cm-cursor, .cm-dropCursor': {
          borderLeftColor: '#10B981',
          borderLeftWidth: '2.5px',
        },
        '&.cm-focused .cm-cursor': {
          borderLeftColor: '#10B981',
        },
        '.cm-gutters': {
          backgroundColor: '#050811',
          color: '#94A3B8',
          borderRight: '1px solid #1E293B',
          paddingRight: '10px',
          paddingLeft: '6px',
        },
        '.cm-lineNumbers .cm-gutterElement': {
          color: '#64748B',
          fontWeight: '500',
          fontSize: `${Math.max(11, fontSize - 2)}px`,
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#F59E0B !important',
          fontWeight: 'bold',
        },
        // NO grey fog / blur on active line - transparent for crystal clear contrast
        '.cm-activeLine': {
          backgroundColor: 'transparent !important',
        },
        '.cm-line': {
          paddingLeft: '8px',
          color: '#FFFFFF',
        },
        // Crisp, high-contrast, zero-blur selection layer
        '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground': {
          backgroundColor: '#1E3A8A !important', // Vivid crisp Royal/Sapphire Blue
          opacity: '1 !important',
        },
        '&.cm-focused .cm-selectionBackground': {
          backgroundColor: '#1E40AF !important',
          opacity: '1 !important',
        },
        // Turn off browser native selection inside CodeMirror lines so it does NOT double-render over CodeMirror's layer (eliminates blur & fuzzy text completely!)
        '.cm-line::selection, .cm-line *::selection, .cm-content ::selection': {
          backgroundColor: 'transparent !important',
          color: 'inherit !important',
        },
      },
      { dark: true }
    );
  }, [fontSize]);

  // Highest precedence keymap: ALWAYS auto-indents 4 spaces by default when Enter is pressed after ':'
  const highestPriorityKeymap = useMemo(() => {
    return Prec.highest(
      keymap.of([
        {
          key: 'Enter',
          run: (view: EditorView): boolean => {
            const { state, dispatch } = view;
            const { head } = state.selection.main;
            const line = state.doc.lineAt(head);
            const textBeforeCursor = line.text.slice(0, head - line.from);
            const trimmed = textBeforeCursor.trimEnd();

            // Find current indentation on this line
            const matchIndent = line.text.match(/^[ \t]*/);
            const currentIndent = matchIndent ? matchIndent[0] : '';

            // If line ends with ':', ALWAYS default-indent +4 spaces on the next line!
            if (trimmed.endsWith(':')) {
              const nextIndent = currentIndent + '    ';
              dispatch(
                state.update({
                  changes: { from: head, insert: '\n' + nextIndent },
                  selection: { anchor: head + 1 + nextIndent.length },
                  userEvent: 'input',
                })
              );
              return true;
            }

            // If inside an indented block, preserve indentation
            if (currentIndent.length > 0) {
              dispatch(
                state.update({
                  changes: { from: head, insert: '\n' + currentIndent },
                  selection: { anchor: head + 1 + currentIndent.length },
                  userEvent: 'input',
                })
              );
              return true;
            }

            // Normal newline
            dispatch(
              state.update({
                changes: { from: head, insert: '\n' },
                selection: { anchor: head + 1 },
                userEvent: 'input',
              })
            );
            return true;
          },
        },
        indentWithTab,
      ])
    );
  }, []);

  const extensions = useMemo(() => {
    return [
      tanglishLanguage,
      syntaxHighlighting(tanglishHighlightStyle),
      autoIndentService,
      highestPriorityKeymap,
      customTheme,
      EditorView.lineWrapping,
      indentUnit.of('    '),
    ];
  }, [customTheme, highestPriorityKeymap]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    const formattedCode = formatTanglishCode(value);
    onChange(formattedCode);
    setFormatted(true);
    setTimeout(() => setFormatted(false), 2000);
  };

  const handleUpdate = (update: ViewUpdate) => {
    if (update.selectionSet || update.docChanged) {
      const state = update.state;
      const head = state.selection.main.head;
      const line = state.doc.lineAt(head);
      setCursorPos({
        line: line.number,
        col: head - line.from + 1,
      });
    }
  };

  // Guard against unwanted empty emission on mount
  const handleCodeChange = useCallback(
    (val: string, viewUpdate: ViewUpdate) => {
      if (val === '' && value && value.trim().length > 0 && !viewUpdate.docChanged) {
        return;
      }
      onChange(val);
    },
    [value, onChange]
  );

  const lineCount = value ? value.split('\n').length : 1;

  return (
    <div className="flex flex-col h-full bg-[#030712] border border-slate-800 rounded-xl overflow-hidden flex-1 min-h-[260px]">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#050811] border-b border-slate-800 select-none shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <FileCode className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-white">main.tpp</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Tanglish++
          </span>
          <span className="text-emerald-400 text-[11px] hidden sm:inline font-mono">
            Colon(:) Auto-Indent Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 mr-1">
            <span>Ln {cursorPos.line}</span>
            <span>,</span>
            <span>Col {cursorPos.col}</span>
            <span className="text-slate-600">|</span>
            <span>{lineCount} lines</span>
          </div>

          {/* Format Button */}
          <button
            onClick={handleFormat}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded transition-colors"
            title="Auto-Fix 4-Space Indentation (வடிவமை)"
          >
            {formatted ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Indented!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Fix Indent</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CodeMirror Viewport - Pure Pitch Black #030712, Solid White Text, Zero Haze */}
      <div className="relative flex-1 h-full overflow-hidden bg-[#030712]">
        <CodeMirror
          value={value}
          height="100%"
          extensions={extensions}
          onChange={handleCodeChange}
          onUpdate={handleUpdate}
          theme="dark"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: false, // Turn off activeLine background to avoid blurry grey fog
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            foldGutter: true,
            tabSize: 4,
            indentOnInput: true,
          }}
          className="h-full font-mono text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
        />
      </div>

      {/* Editor Status Bar */}
      <div className="px-3 sm:px-4 py-1.5 bg-[#050811] border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <Sparkles className="w-3 h-3" />
            <span>High-Contrast Crystal Clear • Colon(:) Auto-Indent • Zero Drift</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Tab: 4 spaces</span>
          <span>Chars: {value ? value.length : 0}</span>
        </div>
      </div>
    </div>
  );
};
