export interface CodeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
}

export const TEMPLATES: CodeTemplate[] = [
  {
    id: 'multiplication-table',
    name: '1. Multiplication Table (வாய்ப்பாடு)',
    category: 'Loops & Math',
    description: 'Generates a 7th multiplication table using varisaiya and range(1, 11).',
    code: `# Tanglish++ (T++) - வாய்ப்பாடு (Multiplication Table)
# Uses: varisaiya, range, sollu with formatted outputs

en = 7
sollu("=== " + string(en) + "th Vaipaadu ===")
sollu("-------------------------")

varisaiya i kulla range(1, 11):
    vidai = en * i
    sollu(string(en) + " x " + string(i) + " = " + string(vidai))

sollu("-------------------------")
sollu("Vaipaadu mudinthathu!")
`,
  },
  {
    id: 'grade-calculator',
    name: '2. Grade Calculator (மதிப்பெண் கணிப்பான்)',
    category: 'Conditionals & Input',
    description: 'Captures student marks using kelu() popup and determines grade with iruntha/illatti/illana.',
    code: `# Tanglish++ - மதிப்பெண் கணிப்பான் (Grade Calculator)
# Uses: kelu() input modal, int(), iruntha, illatti, illana

peyar = kelu("Unga peyar enna? (Enter your name):")
mark_str = kelu("Maths mark evvalavu? (Enter mark out of 100):")
mark = int(mark_str)

sollu("================================")
sollu("Student Report:", peyar)
sollu("Mark Scored   :", mark)

iruntha mark >= 90:
    sollu("Final Result  : Oustanding! 'A+' Grade")
illatti mark >= 80:
    sollu("Final Result  : Very Good! 'A' Grade")
illatti mark >= 60:
    sollu("Final Result  : Good! 'B' Grade")
illatti mark >= 40:
    sollu("Final Result  : Pass! 'C' Grade")
illana:
    sollu("Final Result  : Fail! Kandippa innum nalla padikkanum!")
sollu("================================")
`,
  },
  {
    id: 'oop-student-class',
    name: '3. OOP Student Class (மாணவன் வகுப்பு)',
    category: 'Object Oriented',
    description: 'Demonstrates classes and methods with self reference using ithu.',
    code: `# Tanglish++ - Object-Oriented Programming (OOP)
# Uses: class, ithu (self), fun, list indexing

class Manavan:
    fun __init__(ithu, peyar, roll_no, marks_list):
        ithu.peyar = peyar
        ithu.roll_no = roll_no
        ithu.marks_list = marks_list

    fun total_mark(ithu):
        kootu = 0
        varisaiya m kulla ithu.marks_list:
            kootu += m
        thirupikudu kootu

    fun get_summary(ithu):
        total = ithu.total_mark()
        avg = total / alavu(ithu.marks_list)
        sollu("Student Name :", ithu.peyar)
        sollu("Roll Number  :", ithu.roll_no)
        sollu("Total Marks  :", total)
        sollu("Average      :", avg)
        iruntha avg >= 50:
            sollu("Final Status : Theerchipeduthaar (PASSED)!")
        illana:
            sollu("Final Status : Theerchiyadaiya villai (FAILED)!")

# Create student objects
s1 = Manavan("Karthik", 101, [85, 92, 78, 95, 88])
s2 = Manavan("Ananya", 102, [45, 38, 52, 40, 35])

sollu("=== Student 1 Profile ===")
s1.get_summary()

sollu("\\n=== Student 2 Profile ===")
s2.get_summary()
`,
  },
  {
    id: 'math-stats',
    name: '4. Math & Statistics (கணிதம் & கணக்கெடுப்பு)',
    category: 'Built-in Modules',
    description: 'Performs statistical computations using ganitham and kanakkeduppu.',
    code: `# Tanglish++ - Math & Statistics
# Uses: ganitham and kanakkeduppu modules

import ganitham
import kanakkeduppu

scores = [45, 82, 91, 74, 82, 95, 88, 62, 78, 82]

sollu("Dataset:", scores)
sollu("Count (alavu)    :", alavu(scores))
sollu("Mean (Average)   :", kanakkeduppu.mean(scores))
sollu("Median (Naduvan) :", kanakkeduppu.median(scores))
sollu("Mode (Athigam)   :", kanakkeduppu.mode(scores))

sollu("\\n--- Ganitham (Math) Constants & Functions ---")
sollu("PI constant  :", ganitham.PI)
sollu("Euler E      :", ganitham.E)
sollu("Square root  : sqrt(144) =", ganitham.sqrt(144))
sollu("Power (**)   : 3 ** 4    =", 3 ** 4)
sollu("Floor Div(//): 29 // 4   =", 29 // 4)
sollu("Modulo (%)   : 29 % 4    =", 29 % 4)
`,
  },
  {
    id: 'virtual-os',
    name: '5. Virtual OS & Files (கோப்பு முறைமை)',
    category: 'System & OS',
    description: 'Demonstrates virtual in-memory file system using the os module.',
    code: `# Tanglish++ - Virtual File System Demo
# Uses: os module (mkdir, writeFile, listdir, exists, remove)

import os

sollu("OS Name:", os.name)
sollu("Initial /home/user files:", os.listdir("/home/user"))

# Create a new directory
sollu("\\nCreating project directory...")
os.mkdir("/home/user/my_project")

# Write code into a new virtual file
code_content = "sollu('Vanakkam Ulagam!')"
os.writeFile("/home/user/my_project/app.tpp", code_content)

sollu("Folder exists?", os.exists("/home/user/my_project"))
sollu("/home/user contents now:", os.listdir("/home/user"))
sollu("/home/user/my_project contents:", os.listdir("/home/user/my_project"))
`,
  },
  {
    id: 'try-except-finally',
    name: '6. Error Handling (முயற்சி, தவறு, கண்டிப்பா)',
    category: 'Exception Handling',
    description: 'Robust error trapping with muyarchi, thavaru, and kandippa.',
    code: `# Tanglish++ - Try / Catch / Finally
# Uses: muyarchi, thavaru, kandippa

fun safe_divide(a, b):
    sollu("Dividing", a, "by", b, "...")
    muyarchi:
        vidai = a / b
        sollu("Success! Result is:", vidai)
    thavaru thappu:
        sollu("Thavaru kandupidikka pattathu (Error caught):", thappu)
    kandippa:
        sollu("Kandippa block: This line will always execute!\\n")

# Normal division
safe_divide(100, 4)

# Zero division error
safe_divide(50, 0)
`,
  },
  {
    id: 'datetime-sleep',
    name: '7. Live Timer & Sleep (நேரம்காலம்)',
    category: 'Async & Time',
    description: 'Uses neramkaalam to read current date/time and async sleep (thoongu).',
    code: `# Tanglish++ - Date, Time & Sleep
# Uses: neramkaalam (ippozhuthu, thethi, neram, thoongu)

import neramkaalam

sollu("Date and Time (ippozhuthu):", neramkaalam.ippozhuthu())
sollu("Today Date (thethi)       :", neramkaalam.thethi())
sollu("Current Time (neram)      :", neramkaalam.neram())

sollu("\\nStarting 3-second countdown with thoongu()...")
varisaiya s kulla [3, 2, 1]:
    sollu(string(s) + "...")
    neramkaalam.thoongu(1.0)

sollu("Rocket Launch aayiduchu! 🚀")
`,
  },
  {
    id: 'json-data-structures',
    name: '8. JSON & Data Structures (தரவு வடிவங்கள்)',
    category: 'Data Structures',
    description: 'List manipulation, dictionary operations, and json serialization.',
    code: `# Tanglish++ - JSON and Advanced Data Structures
# Uses: json (dumps, loads), lists, dicts, kutti_fun

import json

# Dictionary with nested lists
developer = {
    "peyar": "Sundar",
    "role": "Lead Architect",
    "languages": ["Tanglish++", "Python", "TypeScript"],
    "experience_years": 8,
    "active": unmai
}

# Modifying dictionary and list
developer["languages"].append("Rust")
developer["experience_years"] += 1

sollu("Developer Object:")
sollu(json.dumps(developer))

# Inline lambda with kutti_fun
double_it = kutti_fun x: x * 2
numbers = [1, 2, 3, 4, 5]
doubled = []

varisaiya n kulla numbers:
    doubled.append(double_it(n))

sollu("\\nOriginal Numbers:", numbers)
sollu("Doubled Numbers :", doubled)
`,
  },
  {
    id: 'extended-libraries-demo',
    name: '9. Extended Libraries Demo (24 நூலகங்கள்)',
    category: 'Extended Modules',
    description: 'Demonstrates kondu_va import keyword, poottu, ragasiyam, vagaigal, sqlite3, and naalkati.',
    code: `# Tanglish++ - 24 Extended Standard Libraries Demo
# Uses: kondu_va, poottu, ragasiyam, vagaigal, sqlite3, naalkati, medai

kondu_va poottu
kondu_va ragasiyam
kondu_va vagaigal
kondu_va sqlite3
kondu_va naalkati
kondu_va medai
kondu_va maatri
kondu_va adaiyalam

sollu("=== Tanglish++ Extended Standard Libraries ===")
sollu("Operating System:", medai.system)
sollu("Browser/Engine  :", medai.browser)

# 1. Poottu (Hashlib)
data = "Vanakkam Tamizha"
sollu("\\n[1] Poottu (Crypto Hashes):")
sollu("Text  :", data)
sollu("SHA256:", poottu.sha256(data))
sollu("MD5   :", poottu.md5(data))

# 2. Ragasiyam (Secrets) & Adaiyalam (UUID)
sollu("\\n[2] Ragasiyam & Adaiyalam:")
sollu("Secure Hex Token :", ragasiyam.token_hex(8))
sollu("Generated UUIDv4 :", adaiyalam.uuid4())

# 3. Maatri (Base64)
b64 = maatri.encode(data)
sollu("\\n[3] Maatri (Base64):")
sollu("Encoded:", b64)
sollu("Decoded:", maatri.decode(b64))

# 4. Vagaigal (Collections Counter)
fruits = ["mango", "apple", "mango", "banana", "mango", "apple"]
sollu("\\n[4] Vagaigal (Counter):")
sollu("List  :", fruits)
sollu("Counts:", vagaigal.Counter(fruits))

# 5. SQLite3 In-Memory Database
sollu("\\n[5] SQLite3 Mock Database:")
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE students (id INT, name TEXT)")
db.execute("INSERT INTO students VALUES (1, 'Karthik')")
rows = db.execute("SELECT * FROM users").fetchall()
sollu("Query result (fetchall):", rows)

# 6. Naalkati (Calendar)
sollu("\\n[6] Naalkati (Calendar for Sep 2026):")
sollu(naalkati.month(2026, 9))

sollu("All extended standard library modules loaded successfully!")
`,
  },
  {
    id: 'string-builtins',
    name: '10. String Built-in Functions (சரங்கள் செயல்பாடுகள்)',
    category: 'Strings & Text',
    description: 'Demonstrates Python-style string built-ins: len, capitalize, centre, find, isalnum, isalpha, isdigit, lower, islower, isupper, upper, title, swapcase, count.',
    code: `# Tanglish++ (T++) - Python-Style String Built-in Functions & Methods
# Featuring: len, capitalize, centre, find, isalnum, isalpha, isdigit,
#            lower, islower, isupper, upper, title, swapcase, count

msg = "vanakkam tamil nadu 2026!"

sollu("==================================================")
sollu("       Tanglish++ String Built-ins Demo")
sollu("==================================================")
sollu("Original string      :", msg)

# 1. len() - Function and method syntax
sollu("\\n[1] Length (len):")
sollu("len(msg)             :", len(msg))
sollu("msg.len()            :", msg.len())

# 2. capitalize() - First letter capital, rest lowercase
sollu("\\n[2] Capitalize:")
sollu("msg.capitalize()     :", msg.capitalize())
sollu("capitalize('hello')  :", capitalize("hello"))

# 3. centre() & center() - Centered padding
sollu("\\n[3] Centre / Center:")
sollu("msg.centre(36, '=')  :", msg.centre(36, "="))
sollu("center('TAMIL', 15)  :", center("TAMIL", 15, "-"))

# 4. find() - Substring search with slice
sollu("\\n[4] Find:")
sollu("msg.find('tamil')    :", msg.find("tamil"))
sollu("msg.find('python')   :", msg.find("python"))  # Returns -1 if not found

# 5. isalnum(), isalpha(), isdigit() - Content validation
sollu("\\n[5] Content Validation:")
sollu("'TN2026'.isalnum()   :", "TN2026".isalnum())
sollu("'Tamil'.isalpha()    :", "Tamil".isalpha())
sollu("'2026'.isdigit()     :", "2026".isdigit())
sollu("isalnum('tn 2026')   :", isalnum("tn 2026"))  # False because of space

# 6. lower(), upper(), islower(), isupper() - Casing and case tests
sollu("\\n[6] Casing & Case Tests:")
sollu("msg.upper()          :", msg.upper())
sollu("msg.lower()          :", msg.lower())
sollu("msg.islower()        :", msg.islower())
sollu("'TAMIL'.isupper()    :", "TAMIL".isupper())

# 7. title() and swapcase() - Styling
sollu("\\n[7] Title & Swapcase:")
sollu("msg.title()          :", msg.title())
sollu("'VaNaKkAm'.swapcase():", "VaNaKkAm".swapcase())

# 8. count() - String and List counts
sollu("\\n[8] Substring & List Count:")
sollu("msg.count('a')       :", msg.count("a"))
sollu("count(msg, 'tamil')  :", count(msg, "tamil"))

fruits = ["mango", "apple", "mango", "banana", "mango"]
sollu("fruits.count('mango'):", fruits.count("mango"))
sollu("len(fruits)          :", len(fruits))

sollu("\\n==================================================")
sollu("All string built-in functions executed successfully!")
`,
  },
  {
    id: 'list-builtins',
    name: '11. List Functions & del Keyword (பட்டியல் செயல்பாடுகள்)',
    category: 'Lists & Collections',
    description: 'Demonstrates Python-style list operations: append, extend, del keyword, remove, pop, clear, index, reverse, sort, max, min, sum.',
    code: `# Tanglish++ (T++) - List Operations & del Keyword
# Featuring: append, extend, del, remove, pop, clear, index,
#            reverse, sort, max, min, sum

sollu("==================================================")
sollu("     Tanglish++ List Operations & del Demo")
sollu("==================================================")

# 1. Creating and Extending lists
heroes = ["Kamal", "Rajini"]
sollu("\\n[1] Append & Extend:")
heroes.append("Ajith")
heroes.extend(["Vijay", "Suriya"])
sollu("Heroes list:", heroes)

# 2. del keyword on list indices and variables
sollu("\\n[2] del / azhi Keyword:")
sollu("Before del heroes[0]:", heroes)
del heroes[0]
sollu("After del heroes[0] :", heroes)

# del on dictionary keys
actor = {"name": "Vijay", "title": "Thalapathy", "age": 50}
sollu("Actor dict before del:", actor)
del actor["age"]
sollu("Actor dict after del :", actor)

# 3. pop() and remove()
sollu("\\n[3] Pop & Remove:")
popped_last = heroes.pop()
sollu("Popped last hero :", popped_last)
sollu("List after pop   :", heroes)

heroes.remove("Ajith")
sollu("After remove('Ajith'):", heroes)

# 4. index()
sollu("\\n[4] Index:")
pos = heroes.index("Vijay")
sollu("Index of 'Vijay' in heroes:", pos)

# 5. reverse()
scores = [45, 98, 12, 76, 89, 34]
sollu("\\n[5] Reverse:")
sollu("Original scores:", scores)
scores.reverse()
sollu("Reversed scores:", scores)

# 6. sort() - Ascending and Descending (unmai)
sollu("\\n[6] Sort:")
scores.sort()
sollu("Sorted ascending :", scores)
scores.sort(unmai)
sollu("Sorted descending:", scores)

# 7. Math functions: max(), min(), sum()
sollu("\\n[7] Math & Aggregate Functions:")
sollu("max(scores) :", max(scores))
sollu("min(scores) :", min(scores))
sollu("sum(scores) :", sum(scores))
sollu("scores.sum():", scores.sum())

# 8. clear()
sollu("\\n[8] Clear:")
scores.clear()
sollu("scores after clear():", scores)
sollu("len(scores)         :", len(scores))

sollu("\\n==================================================")
sollu("All list operations & del statements executed successfully!")
`,
  },
];


