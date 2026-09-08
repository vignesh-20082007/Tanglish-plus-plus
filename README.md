# Tanglish++ (T++) Web IDE

![Tanglish++ Banner](public/tanglish-logo.png)

> **தமிழ்-English Pythonic Programming Language & Modern Interactive Web IDE**

Tanglish++ (T++) is a programming language inspired by Python that uses natural Tamil-English colloquial keywords and expressions. This repository contains the complete frontend IDE built with **React 19, TypeScript, Tailwind CSS, CodeMirror 6**, and an asynchronous **recursive-descent interpreter engine** featuring lexical scoping, OOP with `ithu` (self), and 24 extended standard libraries.

---

## Features

- **Recursive-Descent Interpreter Engine**:
  - Full lexer emitting `INDENT`/`DEDENT` tokens with strict 4-space block scoping.
  - AST construction supporting expressions, statements, control flow, functions, lambdas, and classes.
  - Async runtime loop supporting interactive input (`kelu()`) and non-blocking sleep (`thoongu()`).
  - Scoped variable environments (`Environment`) with parent scope lookups and global `ulagam` binding.
- **CodeMirror 6 Editor**:
  - High-contrast, zero-blur jet-black theme (`#030712`).
  - Google Font **JetBrains Mono** with medium font weight.
  - Instant auto-indentation (+4 spaces) when hitting <kbd>Enter</kbd> after a colon (`:`).
  - Dedicated **Fix Indent** button for one-click block indentation formatting.
  - Zero-drift native cursor and multi-cursor support.
- **24 Extended Standard Libraries**:
  - Networking (`kettuko`, `thodarbu`, `anjal`, `html`, `xml`)
  - Data & Storage (`csv`, `sqlite3`, `semipu`, `vagaigal`, `copy`)
  - System & Security (`medai`, `thunai`, `poottu`, `ragasiyam`, `maatri`, `adaiyalam`)
  - Developer Tools (`kattu`, `pathivu`, `sodhanai`, `nagarvu`, `naalkati`, `thadam`, `parisodhanai`, `kattalai`, `neram`, `ilai`)
- **Retro-Modern Neon Terminal**:
  - Monospace green ANSI output with real-time streaming logs.
  - Accurate execution duration timer in milliseconds.
  - Interactive browser modal for user inputs triggered by `kelu()`.
- **Pre-Loaded Example Programs**:
  - Multiplication Table (வாய்ப்பாடு)
  - Grade Calculator (மதிப்பெண் கணிப்பான்)
  - OOP Student Class (மாணவன் வகுப்பு)
  - Math & Statistics (கணிதம் & கணக்கெடுப்பு)
  - Virtual File System (கோப்பு முறைமை)
  - Try/Except/Finally (முயற்சி, தவறு, கண்டிப்பா)
  - Live Timer & Sleep (நேரம்காலம்)
  - JSON & Data Structures (தரவு வடிவங்கள்)
  - Extended Libraries 24-Module Demo (24 நூலகங்கள்)

---

## Keyword Syntax Reference

| Tanglish++ Keyword | Python Equivalent | Description |
| :--- | :--- | :--- |
| `sollu(*args, sep=" ", end="\n")` | `print(...)` | Print to terminal |
| `kelu("prompt")` | `input(...)` | Pauses execution for interactive user input modal |
| `iruntha condition:` | `if condition:` | Conditional statement |
| `illatti condition:` | `elif condition:` | Else-if condition |
| `illana:` | `else:` | Fallback block |
| `varisaiya i kulla range(1, 11):` | `for i in range(1, 11):` | Loop over ranges or lists (exclusive stop) |
| `irukkura_varai condition:` | `while condition:` | While loop |
| `fun` / `seyal name(args):` | `def name(args):` | Function definition |
| `thirupikudu value` | `return value` | Function return |
| `kutti_fun x: expr` | `lambda x: expr` | Inline anonymous function |
| `class Name:` | `class Name:` | OOP Class definition |
| `ithu` | `self` | Instance self-reference |
| `muyarchi:` | `try:` | Error trapping block |
| `thavaru err:` | `except Exception as err:` | Catch error |
| `kandippa:` | `finally:` | Final block |
| `ulagam var_name` | `global var_name` | Declare variable in global scope |
| `import` / `kondu_va module` | `import module` | Import built-in or extended module |
| `unmai` / `poi` | `True` / `False` | Boolean literals |
| `onnumilla` | `None` | Null / None value |

---

## Quick Start (Run Locally)

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd tanglish-ide

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build
```bash
npm run build
npm run preview
```

---

## License

MIT License. Designed with ❤️ for Tamil programmers and coding enthusiasts.
