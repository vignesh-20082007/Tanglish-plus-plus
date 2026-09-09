import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  X,
  Copy,
  Check,
  PlusCircle,
  Code,
  Layers,
  Box,
  Cpu,
} from 'lucide-react';

interface DocsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet: (code: string) => void;
}

interface DocItem {
  id: string;
  tanglish: string;
  python: string;
  category: 'Keywords' | 'Modules' | 'Functions' | 'Operators' | 'Library Reference';
  desc: string;
  example: string;
}

const DOC_ITEMS: DocItem[] = [
  // Core Keywords
  {
    id: 'sollu',
    tanglish: 'sollu(*args, sep=" ", end="\\n")',
    python: 'print(...)',
    category: 'Keywords',
    desc: 'Prints values to terminal. Supports sep and end parameters.',
    example: 'sollu("Vanakkam", "Tamizha", sep=" - ", end="!\\n")',
  },
  {
    id: 'kelu',
    tanglish: 'kelu("prompt")',
    python: 'input(...)',
    category: 'Keywords',
    desc: 'Pauses execution and opens browser popup modal to capture input.',
    example: 'peyar = kelu("Unga peyar enna? ")\nsollu("Vanakkam", peyar)',
  },
  {
    id: 'iruntha',
    tanglish: 'iruntha condition:\n    ...',
    python: 'if condition:',
    category: 'Keywords',
    desc: 'Executes block if condition is unmai (true).',
    example: 'iruntha mark >= 90:\n    sollu("A+ Grade")',
  },
  {
    id: 'illatti',
    tanglish: 'illatti condition:\n    ...',
    python: 'elif condition:',
    category: 'Keywords',
    desc: 'Alternative condition if preceding iruntha failed.',
    example: 'illatti mark >= 50:\n    sollu("Pass")',
  },
  {
    id: 'illana',
    tanglish: 'illana:\n    ...',
    python: 'else:',
    category: 'Keywords',
    desc: 'Fallback default block if all previous conditions failed.',
    example: 'illana:\n    sollu("Fail")',
  },
  {
    id: 'varisaiya-kaaga',
    tanglish: 'varisaiya i kulla range(start, stop, step):\n    ...',
    python: 'for i in range(...):',
    category: 'Keywords',
    desc: 'For loop iterating over sequences or range (stop is exclusive).',
    example: 'varisaiya i kulla range(1, 6):\n    sollu("Step", i)',
  },
  {
    id: 'irukkura_varai',
    tanglish: 'irukkura_varai condition:\n    ...',
    python: 'while condition:',
    category: 'Keywords',
    desc: 'Executes loop repeatedly while condition is unmai.',
    example: 'count = 3\nirukkura_varai count > 0:\n    sollu(count)\n    count -= 1',
  },
  {
    id: 'fun-seyal',
    tanglish: 'fun name(p1, p2):\n    ...',
    python: 'def name(p1, p2):',
    category: 'Keywords',
    desc: 'Defines a function. Synonym: seyal.',
    example: 'fun kootu(a, b):\n    thirupikudu a + b\n\nsollu(kootu(15, 25))',
  },
  {
    id: 'thirupikudu',
    tanglish: 'thirupikudu value',
    python: 'return value',
    category: 'Keywords',
    desc: 'Returns a value from a function.',
    example: 'thirupikudu x * 2',
  },
  {
    id: 'kutti_fun',
    tanglish: 'kutti_fun x, y: expr',
    python: 'lambda x, y: expr',
    category: 'Keywords',
    desc: 'Inline anonymous lambda function.',
    example: 'irattai = kutti_fun n: n * 2\nsollu(irattai(12))',
  },
  {
    id: 'class-ithu',
    tanglish: 'class Name:\n    fun __init__(ithu, ...):',
    python: 'class Name:\n    def __init__(self, ...):',
    category: 'Keywords',
    desc: 'OOP class definition. Use ithu for self reference.',
    example: 'class Car:\n    fun __init__(ithu, model):\n        ithu.model = model\n\nc = Car("Tesla")\nsollu(c.model)',
  },
  {
    id: 'muyarchi-thavaru',
    tanglish: 'muyarchi:\n    ...\nthavaru err:\n    ...\nkandippa:\n    ...',
    python: 'try:\n    ...\nexcept Exception as err:\n    ...\nfinally:\n    ...',
    category: 'Keywords',
    desc: 'Try-except-finally error handling block.',
    example: 'muyarchi:\n    x = 10 / 0\nthavaru err:\n    sollu("Caught:", err)\nkandippa:\n    sollu("All done!")',
  },
  {
    id: 'ulagam',
    tanglish: 'ulagam var_name',
    python: 'global var_name',
    category: 'Keywords',
    desc: 'Declares variable to have global scope.',
    example: 'count = 0\nfun inc():\n    ulagam count\n    count += 1\ninc()\nsollu(count)',
  },
  {
    id: 'logical-ops',
    tanglish: 'matrum, alladhu, illai',
    python: 'and, or, not',
    category: 'Keywords',
    desc: 'Logical AND (matrum), OR (alladhu), NOT (illai).',
    example: 'iruntha (a > 0) matrum (illai b):\n    sollu("Success")',
  },
  {
    id: 'boolean-literals',
    tanglish: 'unmai, poi, onnumilla',
    python: 'True, False, None',
    category: 'Keywords',
    desc: 'Boolean truth values and None equivalent.',
    example: 'active = unmai\nfailed = poi\nempty = onnumilla',
  },
  {
    id: 'keyword-del',
    tanglish: 'del target / azhi target',
    python: 'del target',
    category: 'Keywords',
    desc: 'Deletes variables (del x), list elements (del list[i]), or dictionary keys (del dict[k]).',
    example: 'fruits = ["apple", "banana", "mango"]\ndel fruits[1]        # ["apple", "mango"]\nuser = {"name": "Karthik", "age": 25}\nazhi user["age"]     # {"name": "Karthik"}',
  },

  // Modules
  {
    id: 'ganitham',
    tanglish: 'import ganitham',
    python: 'import math',
    category: 'Modules',
    desc: 'Constants: PI, E. Functions: sqrt, pow, abs, floor, ceil, round, sin, cos, tan, log.',
    example: 'import ganitham\nsollu("PI:", ganitham.PI)\nsollu("sqrt(100):", ganitham.sqrt(100))',
  },
  {
    id: 'random',
    tanglish: 'import random',
    python: 'import random',
    category: 'Modules',
    desc: 'Generate pseudo-random values: randint(a, b), random(), choice(list).',
    example: 'import random\nsollu("Dice roll:", random.randint(1, 6))',
  },
  {
    id: 'neramkaalam',
    tanglish: 'import neramkaalam',
    python: 'import datetime, time',
    category: 'Modules',
    desc: 'Date and sleep: ippozhuthu(), thethi(), neram(), thoongu(seconds).',
    example: 'import neramkaalam\nsollu("Date:", neramkaalam.thethi())\nneramkaalam.thoongu(1)\nsollu("Woke up!")',
  },
  {
    id: 'os',
    tanglish: 'import os',
    python: 'import os',
    category: 'Modules',
    desc: 'In-memory virtual file system: name, listdir(path), exists(path), mkdir(path), remove(path), writeFile(path, text).',
    example: 'import os\nos.mkdir("/home/user/docs")\nsollu("Files:", os.listdir("/home/user"))',
  },
  {
    id: 'json',
    tanglish: 'import json',
    python: 'import json',
    category: 'Modules',
    desc: 'JSON serialization: dumps(obj), loads(json_string).',
    example: 'import json\nsollu(json.dumps({"city": "Chennai", "code": 600001}))',
  },
  {
    id: 'kanakkeduppu',
    tanglish: 'import kanakkeduppu',
    python: 'import statistics',
    category: 'Modules',
    desc: 'Statistics module: mean(list), median(list), mode(list).',
    example: 'import kanakkeduppu\ndata = [10, 20, 20, 30, 40]\nsollu("Mean:", kanakkeduppu.mean(data))\nsollu("Mode:", kanakkeduppu.mode(data))',
  },
  {
    id: 'sys',
    tanglish: 'import sys',
    python: 'import sys',
    category: 'Modules',
    desc: 'System info: version, platform, exit(code).',
    example: 'import sys\nsollu("Version :", sys.version)\nsollu("Platform:", sys.platform)',
  },

  // Functions
  {
    id: 'type-conversions',
    tanglish: 'int(x), float(x), string(x)',
    python: 'int, float, str',
    category: 'Functions',
    desc: 'Converts values between integer, float, and string representations.',
    example: 'n = int("42")\ns = string(3.14)',
  },
  {
    id: 'alavu',
    tanglish: 'alavu(x) / len(x)',
    python: 'len(x)',
    category: 'Functions',
    desc: 'Returns the length of a string, list, or dictionary (supported as len(x), alavu(x), or x.len()).',
    example: 'msg = "Tanglish"\nsollu("Length:", len(msg))\nsollu("List len:", [1, 2, 3].len())',
  },
  {
    id: 'str-capitalize',
    tanglish: 's.capitalize() / capitalize(s)',
    python: 's.capitalize()',
    category: 'Functions',
    desc: 'Converts first character of string to uppercase and rest to lowercase.',
    example: 'msg = "vanakkam TAMIL"\nsollu(msg.capitalize())  # "Vanakkam tamil"',
  },
  {
    id: 'str-centre',
    tanglish: 's.centre(w, fill) / s.center(w, fill)',
    python: 's.center(w, fill)',
    category: 'Functions',
    desc: 'Returns a centered string of length w, padded with fill character (default: space). Supports both centre and center.',
    example: 'msg = "Tanglish++"\nsollu(msg.centre(20, "="))\nsollu(centre(msg, 20, "*"))',
  },
  {
    id: 'str-find',
    tanglish: 's.find(sub, start, end)',
    python: 's.find(...)',
    category: 'Functions',
    desc: 'Finds first index of substring within range [start, end]. Returns -1 if not found.',
    example: 'text = "vanakkam tamizha"\nsollu("Index of tamizha:", text.find("tamizha"))\nsollu("Not found:", text.find("python"))  # -1',
  },
  {
    id: 'str-checks',
    tanglish: 's.isalnum(), s.isalpha(), s.isdigit()',
    python: 'isalnum, isalpha, isdigit',
    category: 'Functions',
    desc: 'Validates string content: isalnum (letters & numbers), isalpha (only letters), isdigit (only digits).',
    example: 'sollu("Tamil2026".isalnum()) # unmai\nsollu("Tamil".isalpha())     # unmai\nsollu("2026".isdigit())      # unmai',
  },
  {
    id: 'str-cases',
    tanglish: 's.lower(), s.upper(), s.islower(), s.isupper()',
    python: 'lower, upper, islower, isupper',
    category: 'Functions',
    desc: 'Converts casing or tests if all cased characters in string are lower/upper.',
    example: 'word = "Tamizhan"\nsollu(word.upper())      # "TAMIZHAN"\nsollu(word.lower())      # "tamizhan"\nsollu(word.isupper())    # poi',
  },
  {
    id: 'str-title-swap',
    tanglish: 's.title(), s.swapcase()',
    python: 's.title(), s.swapcase()',
    category: 'Functions',
    desc: 'title() capitalizes each word boundary. swapcase() inverts lowercase and uppercase letters.',
    example: 'title_str = "hello world tanglish".title()\nswap_str = "VaNaKkAm".swapcase()\nsollu(title_str)  # "Hello World Tanglish"\nsollu(swap_str)   # "vAnAkKaM"',
  },
  {
    id: 'str-count',
    tanglish: 's.count(sub, start, end)',
    python: 's.count(...)',
    category: 'Functions',
    desc: 'Counts non-overlapping occurrences of substring in string (or element in list).',
    example: 'text = "banana"\nsollu("Count of an:", text.count("an"))  # 2\nnums = [1, 2, 1, 1, 3]\nsollu("Count of 1 in list:", nums.count(1))  # 3',
  },
  {
    id: 'list-modify',
    tanglish: 'list.append(x), list.extend(iterable), list.insert(i, x)',
    python: 'append, extend, insert',
    category: 'Functions',
    desc: 'Modifies list by appending, extending with another list/string, or inserting at index.',
    example: 'nums = [1, 2]\nnums.append(3)\nnums.extend([4, 5])\nsollu(nums)  # [1, 2, 3, 4, 5]',
  },
  {
    id: 'list-delete-find',
    tanglish: 'list.remove(x), list.pop(i?), list.clear(), list.index(x)',
    python: 'remove, pop, clear, index',
    category: 'Functions',
    desc: 'Removes first matching item, pops item at index (default last), clears list, or finds index of item.',
    example: 'items = ["a", "b", "c"]\nitems.remove("b")   # ["a", "c"]\nlast = items.pop()   # "c"\nidx = items.index("a") # 0',
  },
  {
    id: 'list-order',
    tanglish: 'list.reverse(), list.sort(reverse?)',
    python: 'reverse, sort',
    category: 'Functions',
    desc: 'Reverses list elements in place, or sorts list in ascending/descending order.',
    example: 'scores = [50, 10, 80, 20]\nscores.sort()\nsollu("Ascending :", scores)\nscores.sort(unmai)\nsollu("Descending:", scores)',
  },
  {
    id: 'list-math',
    tanglish: 'max(seq), min(seq), sum(seq, start?)',
    python: 'max, min, sum',
    category: 'Functions',
    desc: 'Returns maximum, minimum, or sum of items in a list or sequence (supported both as functions and methods).',
    example: 'marks = [85, 92, 78, 96]\nsollu("Max mark:", max(marks))\nsollu("Min mark:", min(marks))\nsollu("Total   :", sum(marks))',
  },
  {
    id: 'vagai',
    tanglish: 'vagai(x)',
    python: 'type(x)',
    category: 'Functions',
    desc: 'Returns the data type name string (e.g. number, string, list, dict, class, function).',
    example: 'sollu(vagai("Vanakkam"))  # string\nsollu(vagai([1, 2]))      # list',
  },
  {
    id: 'chr-ord',
    tanglish: 'chr(x), ord(c)',
    python: 'chr, ord',
    category: 'Functions',
    desc: 'Converts between Unicode character code and character.',
    example: 'sollu("Char:", chr(65))      # A\nsollu("Code:", ord("A"))      # 65',
  },
  {
    id: 'range',
    tanglish: 'range(start, stop, step)',
    python: 'range(...)',
    category: 'Functions',
    desc: 'Generates arithmetic sequence where stop is exclusive.',
    example: 'varisaiya x kulla range(0, 10, 2):\n    sollu(x)',
  },

  // Operators
  {
    id: 'advanced-operators',
    tanglish: '** (Power), // (Floor Division)',
    python: '**, //',
    category: 'Operators',
    desc: 'Exponentiation (right-associative) and floor division operator.',
    example: 'pow_val = 2 ** 8    # 256\nfloor_val = 19 // 4  # 4\nsollu(pow_val, floor_val)',
  },

  // --- 24 EXTENDED STANDARD LIBRARIES (Library Reference) ---
  {
    id: 'lib-kettuko',
    tanglish: 'kondu_va kettuko',
    python: 'import requests',
    category: 'Library Reference',
    desc: 'HTTP client for web requests supporting get(url) and post(url, data) using fetch API.',
    example: 'kondu_va kettuko\nres = kettuko.get("https://api.github.com")\nsollu("Status:", res.status_code)',
  },
  {
    id: 'lib-thodarbu',
    tanglish: 'kondu_va thodarbu',
    python: 'import socket',
    category: 'Library Reference',
    desc: 'Mock TCP network socket interface supporting connect, send, recv, and close.',
    example: 'kondu_va thodarbu\ns = thodarbu.connect("localhost", 8080)\ns.send("GET / HTTP/1.1")\nsollu(s.recv())',
  },
  {
    id: 'lib-anjal',
    tanglish: 'kondu_va anjal',
    python: 'import smtplib',
    category: 'Library Reference',
    desc: 'SMTP email dispatch stub providing send(to, msg) functionality.',
    example: 'kondu_va anjal\nsollu(anjal.send("dev@tamil.com", "Vanakkam!"))',
  },
  {
    id: 'lib-html',
    tanglish: 'kondu_va html',
    python: 'import html',
    category: 'Library Reference',
    desc: 'HTML and XML entity utilities providing escape(str) and unescape(str).',
    example: 'kondu_va html\nesc = html.escape("<h1>Vanakkam</h1>")\nsollu("Escaped:", esc)',
  },
  {
    id: 'lib-csv',
    tanglish: 'kondu_va csv',
    python: 'import csv',
    category: 'Library Reference',
    desc: 'Comma-separated values utility providing parse(text) and stringify(data).',
    example: 'kondu_va csv\ndata = [["Name", "Score"], ["Priya", 98]]\ncsv_text = csv.stringify(data)\nsollu("Parsed:", csv.parse(csv_text))',
  },
  {
    id: 'lib-sqlite3',
    tanglish: 'kondu_va sqlite3',
    python: 'import sqlite3',
    category: 'Library Reference',
    desc: 'In-memory relational SQL database engine supporting execute, fetchall, and fetchone.',
    example: 'kondu_va sqlite3\ndb = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE t (id INT)")\nsollu(db.execute("SELECT * FROM users").fetchall())',
  },
  {
    id: 'lib-semipu',
    tanglish: 'kondu_va semipu',
    python: 'import pickle',
    category: 'Library Reference',
    desc: 'Object serialization and state persistence providing dumps(obj) and loads(str).',
    example: 'kondu_va semipu\npickled = semipu.dumps({"app": "Tanglish++"})\nsollu(semipu.loads(pickled))',
  },
  {
    id: 'lib-vagaigal',
    tanglish: 'kondu_va vagaigal',
    python: 'from collections import Counter',
    category: 'Library Reference',
    desc: 'Advanced collections providing Counter(list) to compute frequency counts.',
    example: 'kondu_va vagaigal\ncounts = vagaigal.Counter(["apple", "banana", "apple"])\nsollu(counts)',
  },
  {
    id: 'lib-copy',
    tanglish: 'kondu_va copy',
    python: 'import copy',
    category: 'Library Reference',
    desc: 'Shallow and recursive deep copying operations (copy, deepcopy).',
    example: 'kondu_va copy\ncloned = copy.deepcopy([1, [2, 3]])\nsollu("Deep copy:", cloned)',
  },
  {
    id: 'lib-medai',
    tanglish: 'kondu_va medai',
    python: 'import platform',
    category: 'Library Reference',
    desc: 'Host platform, browser user-agent, and runtime environment properties.',
    example: 'kondu_va medai\nsollu("OS  :", medai.system)\nsollu("Arch:", medai.architecture)',
  },
  {
    id: 'lib-thunai',
    tanglish: 'kondu_va thunai',
    python: 'import subprocess',
    category: 'Library Reference',
    desc: 'Subprocess management stub providing run(cmd) to simulate shell execution.',
    example: 'kondu_va thunai\nres = thunai.run("echo Hello")\nsollu("Output:", res["stdout"])',
  },
  {
    id: 'lib-poottu',
    tanglish: 'kondu_va poottu',
    python: 'import hashlib',
    category: 'Library Reference',
    desc: 'Cryptographic hashing algorithms offering sha256(text) and md5(text).',
    example: 'kondu_va poottu\nsollu("SHA256:", poottu.sha256("Tanglish"))\nsollu("MD5   :", poottu.md5("Tanglish"))',
  },
  {
    id: 'lib-ragasiyam',
    tanglish: 'kondu_va ragasiyam',
    python: 'import secrets',
    category: 'Library Reference',
    desc: 'Generates cryptographically secure random numbers and tokens (token_hex).',
    example: 'kondu_va ragasiyam\nsollu("Secure Hex:", ragasiyam.token_hex(16))',
  },
  {
    id: 'lib-maatri',
    tanglish: 'kondu_va maatri',
    python: 'import base64',
    category: 'Library Reference',
    desc: 'Base64 binary-to-text encoding and decoding (encode, decode).',
    example: 'kondu_va maatri\nenc = maatri.encode("Secret String")\nsollu(enc, maatri.decode(enc))',
  },
  {
    id: 'lib-adaiyalam',
    tanglish: 'kondu_va adaiyalam',
    python: 'import uuid',
    category: 'Library Reference',
    desc: 'Generates RFC4122 compliant Universally Unique Identifiers (uuid4).',
    example: 'kondu_va adaiyalam\nsollu("UUID4:", adaiyalam.uuid4())',
  },
  {
    id: 'lib-kattu',
    tanglish: 'kondu_va kattu',
    python: 'import zipfile',
    category: 'Library Reference',
    desc: 'Mock archive compression and payload extraction (compress, extract).',
    example: 'kondu_va kattu\narc = kattu.compress("Data Payload")\nsollu(kattu.extract(arc))',
  },
  {
    id: 'lib-pathivu',
    tanglish: 'kondu_va pathivu',
    python: 'import logging',
    category: 'Library Reference',
    desc: 'Application event logging system providing info(msg), warn(msg), and error(msg).',
    example: 'kondu_va pathivu\nsollu(pathivu.info("System healthy"))\nsollu(pathivu.warn("High load"))',
  },
  {
    id: 'lib-sodhanai',
    tanglish: 'kondu_va sodhanai',
    python: 'import unittest',
    category: 'Library Reference',
    desc: 'Unit testing assertions and runner (assert_equal, run_tests).',
    example: 'kondu_va sodhanai\nsodhanai.assert_equal(5 * 5, 25)\nsollu(sodhanai.run_tests())',
  },
  {
    id: 'lib-nagarvu',
    tanglish: 'kondu_va nagarvu',
    python: 'import shutil',
    category: 'Library Reference',
    desc: 'High-level filesystem operations (copy_file, move_folder).',
    example: 'kondu_va nagarvu\nnagarvu.copy_file("/home/user/notes.txt", "/home/user/notes_bak.txt")',
  },
  {
    id: 'lib-naalkati',
    tanglish: 'kondu_va naalkati',
    python: 'import calendar',
    category: 'Library Reference',
    desc: 'Calendar generation providing month(year, month) for formatted ASCII calendars.',
    example: 'kondu_va naalkati\nsollu(naalkati.month(2026, 9))',
  },
  {
    id: 'lib-thadam',
    tanglish: 'kondu_va thadam',
    python: 'import traceback',
    category: 'Library Reference',
    desc: 'Inspects and formats execution traces and exception call stacks (print_exc).',
    example: 'kondu_va thadam\nsollu(thadam.print_exc())',
  },
  {
    id: 'lib-parisodhanai',
    tanglish: 'kondu_va parisodhanai',
    python: 'import inspect',
    category: 'Library Reference',
    desc: 'Inspects runtime objects and extracts function source code representations (get_source).',
    example: 'kondu_va parisodhanai\nfun test_fn(): sollu("Hello")\nsollu(parisodhanai.get_source(test_fn))',
  },
  {
    id: 'lib-kattalai',
    tanglish: 'kondu_va kattalai',
    python: 'import argparse',
    category: 'Library Reference',
    desc: 'Virtual command-line argument parser (ArgumentParser, add_argument, parse_args).',
    example: 'kondu_va kattalai\np = kattalai.ArgumentParser()\np.add_argument("--mode", "prod")\nsollu(p.parse_args())',
  },
  {
    id: 'lib-neram',
    tanglish: 'kondu_va neram',
    python: 'import time',
    category: 'Library Reference',
    desc: 'Unix epoch timestamp in seconds and millisecond sleep delay (time, sleep).',
    example: 'kondu_va neram\nt0 = neram.time()\nneram.sleep(50)\nsollu("Elapsed:", neram.time() - t0)',
  },
  {
    id: 'lib-ilai',
    tanglish: 'kondu_va ilai',
    python: 'import threading',
    category: 'Library Reference',
    desc: 'Pseudo-parallel asynchronous execution thread (Thread, start, join).',
    example: 'kondu_va ilai\nfun task(): sollu("Background worker active!")\nt = ilai.Thread(task)\nt.start()\nt.join()',
  },
];

export const DocsSidebar: React.FC<DocsSidebarProps> = ({
  isOpen,
  onClose,
  onInsertSnippet,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Library Reference', 'Keywords', 'Modules', 'Functions', 'Operators'];

  const filteredItems = DOC_ITEMS.filter(item => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.tanglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.python.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] bg-[#0A0F1D] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#0E1528] border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <img
            src="/tanglish-logo.png"
            alt="Tanglish++ Logo"
            className="w-8 h-8 rounded-lg shadow-md ring-1 ring-cyan-400/30 object-cover"
          />
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Tanglish++ Reference Guide</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                Docs
              </span>
            </h2>
            <p className="text-xs text-slate-400">Keywords, Modules &amp; Built-in Functions</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Close Docs"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="p-4 bg-[#0A0F1D] border-b border-slate-800/80 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search keywords, modules (e.g. sollu, ganitham)..."
            className="w-full pl-9 pr-4 py-2 bg-[#060913] border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Docs List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No matching Tanglish++ features found.
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className="p-3.5 bg-[#0F172A] border border-slate-800 rounded-xl hover:border-slate-700 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {item.tanglish}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Python equivalent: <span className="text-slate-300">{item.python}</span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono shrink-0">
                  {item.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {item.desc}
              </p>

              {/* Code Snippet Box */}
              <div className="mt-3 relative bg-[#070B14] border border-slate-800/90 rounded-lg p-2.5 overflow-x-auto">
                <pre className="font-mono-code text-[11px] text-emerald-400 whitespace-pre">
                  {item.example}
                </pre>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/60 justify-end">
                  <button
                    onClick={() => handleCopy(item.id, item.example)}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                    title="Copy snippet"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onInsertSnippet(item.example)}
                    className="flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30 transition-colors"
                    title="Insert snippet into code editor"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Insert into Code</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Docs Footer */}
      <div className="p-3 bg-[#0E1528] border-t border-slate-800 text-center text-[11px] text-slate-500 font-mono">
        Tanglish++ Language Specification • Inspired by Python 3
      </div>
    </div>
  );
};
