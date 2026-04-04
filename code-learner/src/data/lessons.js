// ─────────────────────────────────────────────
//  CODE LEARNER  ·  Lesson Data
//  Each lesson: title, timestamps, content
//  sections, code snippet, quiz, challenge
//  XP per lesson = floor(totalLangXP / totalLessons)
// ─────────────────────────────────────────────

export const LANGUAGES = [
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    color: '#3776AB',
    grad: 'linear-gradient(135deg,#3776AB,#FFD343)',
    tagline: 'Beginner-friendly · AI · Data Science · Backend',
    totalXP: 1200,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '⚡',
    color: '#F7DF1E',
    grad: 'linear-gradient(135deg,#F7DF1E,#ff6b35)',
    tagline: 'Web Interactivity · Frontend · Node.js · APIs',
    totalXP: 1200,
  },
  {
    id: 'htmlcss',
    name: 'HTML & CSS',
    icon: '🎨',
    color: '#E34F26',
    grad: 'linear-gradient(135deg,#E34F26,#264de4)',
    tagline: 'Web Structure · Styling · Responsive Design · Layouts',
    totalXP: 1200,
  },
  {
    id: 'fullstack',
    name: 'Full Stack Web',
    icon: '🌐',
    color: '#61DAFB',
    grad: 'linear-gradient(135deg,#61DAFB,#764abc)',
    tagline: 'React · Node.js · Databases · Deployment',
    totalXP: 1200,
  },
];

// ─── PYTHON ──────────────────────────────────
const pythonLessons = {
  beginner: [
    {
      id: 'py-b-1',
      title: 'Welcome to Python',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'What is Python?' },
        { time: '1:20', label: 'Why learn Python?' },
        { time: '2:45', label: 'Installing Python & running your first file' },
        { time: '4:10', label: 'The print() function' },
      ],
      theory: `Python is one of the world's most popular and beginner-friendly programming languages. Created by Guido van Rossum in 1991, Python's philosophy is simple: **code should be readable and clean**.

Python is used everywhere — from building websites (Instagram, YouTube) to training AI models (ChatGPT uses Python), data analysis, automation, and even space exploration scripts at NASA.

The beauty of Python is that it reads almost like plain English. You don't need to worry about complex syntax — Python lets you focus on **solving problems**, not fighting the language.`,
      concepts: [
        { label: 'Interpreted', desc: 'Python runs line by line — no compilation step needed.' },
        { label: 'Dynamically typed', desc: 'You don\'t declare variable types — Python figures it out.' },
        { label: 'Indentation-based', desc: 'Python uses spaces/tabs to define code blocks, not braces.' },
      ],
      code: `# Your very first Python program!
print("Hello, World!")

# print() displays text to the screen
print("Welcome to Code Learner!")
print("Let's learn Python together!")

# You can print numbers too
print(42)
print(3.14)

# And multiple things at once
print("My age is", 20, "years old")`,
      quiz: {
        question: 'Which function is used to display output on the screen in Python?',
        options: ['show()', 'display()', 'print()', 'output()'],
        answer: 2,
        explanation: 'print() is Python\'s built-in function for displaying output. It\'s one of the most used functions you\'ll write every day!',
      },
      challenge: {
        title: 'Your First Python Program',
        description: 'Write a Python program that prints your name, your age, and your favourite programming language on three separate lines.',
        hint: 'Use print() three times — once for each piece of information.',
        example: `print("Alice")
print(20)
print("Python")`,
      },
    },
    {
      id: 'py-b-2',
      title: 'Variables & Data Types',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'What is a variable?' },
        { time: '1:30', label: 'Creating variables in Python' },
        { time: '3:00', label: 'The 4 basic data types' },
        { time: '5:15', label: 'The type() function' },
        { time: '6:40', label: 'Naming rules for variables' },
      ],
      theory: `A **variable** is like a labelled box that stores a value. You give it a name, and Python remembers the value inside it so you can use it later.

In Python, creating a variable is as simple as writing \`name = value\`. Unlike many other languages, you don't need to declare the type — Python automatically works out whether your variable holds text, a number, or something else.

There are **4 fundamental data types** every Python developer uses daily:
- **str** (string) — text, always in quotes
- **int** (integer) — whole numbers
- **float** — decimal numbers  
- **bool** (boolean) — True or False only`,
      concepts: [
        { label: 'str', desc: 'Stores text. Always wrapped in quotes: "hello" or \'world\'.' },
        { label: 'int', desc: 'Whole numbers — positive, negative, or zero: 42, -7, 0.' },
        { label: 'float', desc: 'Decimal numbers: 3.14, -0.5, 100.0.' },
        { label: 'bool', desc: 'Only two values: True or False. Case-sensitive in Python!' },
      ],
      code: `# Creating variables
name = "Alice"          # str  — text
age = 25                # int  — whole number
height = 5.7            # float — decimal
is_student = True       # bool — True or False

# Printing variables
print(name)             # Alice
print(age)              # 25
print(height)           # 5.7
print(is_student)       # True

# Check the type of any variable
print(type(name))       # <class 'str'>
print(type(age))        # <class 'int'>
print(type(height))     # <class 'float'>
print(type(is_student)) # <class 'bool'>

# Variables can be updated
age = 26
print("New age:", age)  # New age: 26`,
      quiz: {
        question: 'What data type is the value True in Python?',
        options: ['str', 'int', 'float', 'bool'],
        answer: 3,
        explanation: 'True and False are boolean (bool) values. They are used for logical conditions and must be capitalised in Python — true would cause an error!',
      },
      challenge: {
        title: 'Build a Personal Profile',
        description: 'Create variables to store your personal profile: your name (string), your age (integer), your GPA or score (float), and whether you are a student (boolean). Then print all four variables with a label.',
        hint: 'For the label use: print("Name:", name)',
        example: `name = "Bob"
age = 22
gpa = 3.8
is_student = True
print("Name:", name)
print("Age:", age)
print("GPA:", gpa)
print("Student:", is_student)`,
      },
    },
    {
      id: 'py-b-3',
      title: 'Operators & Expressions',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Arithmetic operators (+, -, *, /)' },
        { time: '2:10', label: 'Integer division and modulus' },
        { time: '3:45', label: 'Power operator **' },
        { time: '5:00', label: 'Comparison operators' },
        { time: '6:30', label: 'Logical operators (and, or, not)' },
      ],
      theory: `Operators let you perform operations on values and variables. Think of them as the **verbs** of programming — they describe what to *do* with data.

**Arithmetic operators** perform maths. Python follows standard order of operations (PEMDAS/BODMAS) — brackets first, then powers, then multiplication/division, then addition/subtraction.

**Comparison operators** compare two values and return True or False. These are the backbone of every decision your program makes.

**Logical operators** (and, or, not) combine multiple conditions — just like in everyday English: "If it's raining *and* I have an umbrella, I'll be fine."`,
      concepts: [
        { label: '//', desc: 'Floor division — divides and rounds DOWN to nearest integer. 7//2 = 3.' },
        { label: '%', desc: 'Modulus — returns the remainder. 7%2 = 1. Great for checking odd/even!' },
        { label: '**', desc: 'Power/exponent. 2**8 = 256. Much cleaner than calling a function.' },
        { label: '==', desc: 'Checks equality. Don\'t confuse with = (assignment). 5==5 is True.' },
      ],
      code: `# ── Arithmetic Operators ──────────────────
x = 10
y = 3

print(x + y)    # 13  — Addition
print(x - y)    # 7   — Subtraction
print(x * y)    # 30  — Multiplication
print(x / y)    # 3.333... — Division (always float)
print(x // y)   # 3   — Floor division (integer result)
print(x % y)    # 1   — Modulus (remainder)
print(x ** y)   # 1000 — Power (10 to the 3)

# ── Comparison Operators ──────────────────
print(10 > 5)   # True
print(10 < 5)   # False
print(10 == 10) # True
print(10 != 5)  # True
print(10 >= 10) # True

# ── Logical Operators ─────────────────────
a = True
b = False
print(a and b)  # False — both must be True
print(a or b)   # True  — at least one True
print(not a)    # False — flips the boolean`,
      quiz: {
        question: 'What is the result of 17 % 5 in Python?',
        options: ['3', '2', '3.4', '0'],
        answer: 1,
        explanation: '17 % 5 gives the remainder when 17 is divided by 5. 5 goes into 17 three times (15), leaving a remainder of 2. So 17 % 5 = 2.',
      },
      challenge: {
        title: 'The Calculator',
        description: 'Write a program that declares two numbers (any values you like) and prints: their sum, difference, product, integer quotient, remainder, and the first number raised to the power of the second.',
        hint: 'Declare a = 15 and b = 4, then use all 6 operators in 6 print() statements.',
        example: `a = 15
b = 4
print("Sum:", a + b)
print("Difference:", a - b)
print("Product:", a * b)
print("Quotient:", a // b)
print("Remainder:", a % b)
print("Power:", a ** b)`,
      },
    },
    {
      id: 'py-b-4',
      title: 'Strings In Depth',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Creating and indexing strings' },
        { time: '1:45', label: 'String slicing' },
        { time: '3:20', label: 'f-strings — modern formatting' },
        { time: '5:00', label: 'Essential string methods' },
        { time: '7:10', label: 'String immutability' },
      ],
      theory: `Strings are one of the most used data types in Python. A string is simply a **sequence of characters** — letters, numbers, spaces, punctuation — wrapped in quotes.

Every character in a string has an **index** (position), starting at 0. You can access individual characters or ranges of characters using this index — this is called **slicing**.

**f-strings** (formatted string literals) are the modern, recommended way to embed variables directly inside strings. They're faster, more readable, and less error-prone than older approaches like + concatenation.`,
      concepts: [
        { label: 'Indexing', desc: 'Access a character by position. text[0] = first character. text[-1] = last.' },
        { label: 'Slicing', desc: 'text[start:end] extracts a portion. end is exclusive (not included).' },
        { label: 'f-strings', desc: 'f"Hello {name}" — embed any expression inside {}.' },
        { label: 'Immutable', desc: 'Strings cannot be changed in place. Methods return a NEW string.' },
      ],
      code: `# ── Creating Strings ─────────────────────
greeting = "Hello, World!"
name = 'Python'          # single or double quotes

# ── Indexing ──────────────────────────────
print(greeting[0])       # H  — first character
print(greeting[-1])      # !  — last character
print(greeting[7])       # W

# ── Slicing ───────────────────────────────
print(greeting[0:5])     # Hello  (index 0,1,2,3,4)
print(greeting[7:])      # World! (from index 7 to end)
print(greeting[:5])      # Hello  (from start to 4)
print(greeting[::2])     # Hlo ol! (every 2nd char)

# ── f-strings (modern formatting) ─────────
age = 25
city = "Mumbai"
print(f"My name is {name}, I am {age} years old.")
print(f"I live in {city.upper()}")
print(f"Next year I'll be {age + 1}")

# ── Useful Methods ────────────────────────
text = "  hello world  "
print(text.strip())           # "hello world"  — remove spaces
print(text.strip().upper())   # "HELLO WORLD"
print(text.strip().title())   # "Hello World"
print(greeting.replace("World", "Python"))
print("a,b,c,d".split(","))  # ['a','b','c','d']
print(len(greeting))          # 13 — length`,
      quiz: {
        question: 'What does "Python"[1:4] return?',
        options: ['"Pyt"', '"yth"', '"ytho"', '"ython"'],
        answer: 1,
        explanation: 'Slicing [1:4] starts at index 1 (y) and goes up to but NOT including index 4 (o). So we get characters at index 1, 2, 3 — which is "yth".',
      },
      challenge: {
        title: 'String Manipulator',
        description: 'Given the string sentence = "the quick brown fox", write code to: (1) Print it in ALL CAPS, (2) Print only the first 9 characters, (3) Print how many characters it has, (4) Replace "fox" with "dog" and print it, (5) Print it in Title Case.',
        hint: 'Use .upper(), slicing, len(), .replace(), and .title() methods.',
        example: `sentence = "the quick brown fox"
print(sentence.upper())
print(sentence[:9])
print(len(sentence))
print(sentence.replace("fox", "dog"))
print(sentence.title())`,
      },
    },
    {
      id: 'py-b-5',
      title: 'Lists',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'What is a list?' },
        { time: '1:15', label: 'Creating and accessing lists' },
        { time: '2:50', label: 'Modifying lists — append, insert, remove' },
        { time: '4:30', label: 'Slicing lists' },
        { time: '5:45', label: 'Useful list methods' },
        { time: '7:00', label: 'Nested lists' },
      ],
      theory: `A **list** is an ordered, mutable (changeable) collection of items. Lists are one of Python's most versatile and commonly used data structures.

Unlike strings, lists **can store items of mixed types** — numbers, strings, booleans, even other lists! And unlike strings, lists are **mutable** — you can change, add, and remove items after creation.

Lists are defined with square brackets \`[]\` and items are separated by commas. Each item has an index starting at 0, just like strings.`,
      concepts: [
        { label: 'Ordered', desc: 'Items have a fixed position. The order is preserved.' },
        { label: 'Mutable', desc: 'Unlike strings, you can change list items after creation.' },
        { label: 'append()', desc: 'Adds one item to the END. The most common way to grow a list.' },
        { label: 'pop()', desc: 'Removes and RETURNS the last item (or item at given index).' },
      ],
      code: `# ── Creating Lists ───────────────────────
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [42, "hello", True, 3.14]     # mixed types OK!
empty = []                              # empty list

# ── Accessing Items ───────────────────────
print(fruits[0])        # apple  — first item
print(fruits[-1])       # cherry — last item
print(fruits[1:3])      # ['banana', 'cherry']

# ── Modifying ─────────────────────────────
fruits.append("mango")         # Add to end
fruits.insert(1, "grape")      # Insert at index 1
fruits.remove("banana")        # Remove first occurrence
popped = fruits.pop()          # Remove & return last item
print("Removed:", popped)

# ── Useful Methods ────────────────────────
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print(len(numbers))     # 8 — length
print(min(numbers))     # 1 — smallest
print(max(numbers))     # 9 — largest
print(sum(numbers))     # 31 — total
numbers.sort()          # Sort in place
print(numbers)          # [1,1,2,3,4,5,6,9]
numbers.reverse()       # Reverse in place
print(numbers[0])       # 9

# ── Nested Lists ──────────────────────────
matrix = [[1,2,3],[4,5,6],[7,8,9]]
print(matrix[1][2])     # 6 — row 1, col 2`,
      quiz: {
        question: 'Which method adds an item to the END of a list?',
        options: ['add()', 'insert()', 'append()', 'push()'],
        answer: 2,
        explanation: 'append() adds a single item to the END of the list. insert(index, item) adds at a specific position. Python has no push() — that\'s JavaScript!',
      },
      challenge: {
        title: 'Shopping Cart',
        description: 'Build a shopping cart simulation. Create an empty list called cart. Add 4 items to it using append(). Then: print the full cart, print how many items are in it, remove the second item, add a new item at the beginning using insert(), and print the final cart.',
        hint: 'Use append() to add, insert(0, item) to add at start, and del cart[1] or remove() to delete.',
        example: `cart = []
cart.append("milk")
cart.append("bread")
cart.append("eggs")
cart.append("butter")
print("Cart:", cart)
print("Items:", len(cart))
cart.remove("bread")
cart.insert(0, "coffee")
print("Final cart:", cart)`,
      },
    },
    {
      id: 'py-b-6',
      title: 'Conditionals — if / elif / else',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Making decisions in code' },
        { time: '1:00', label: 'The if statement' },
        { time: '2:30', label: 'if-else — two paths' },
        { time: '4:00', label: 'if-elif-else — multiple paths' },
        { time: '5:45', label: 'Nested conditions' },
        { time: '7:00', label: 'One-line conditionals (ternary)' },
      ],
      theory: `Programs need to make decisions — and that's exactly what **conditionals** do. An if statement checks a condition (which evaluates to True or False) and executes a block of code only if the condition is True.

This is the foundation of all logic in programming. Every program you'll ever write will use conditionals — from simple apps to complex AI systems.

Python uses **indentation** (4 spaces or 1 tab) to define what code belongs inside an if block. This forces readable, clean code — one of Python's greatest design decisions.`,
      concepts: [
        { label: 'if', desc: 'Runs code ONLY if the condition is True.' },
        { label: 'elif', desc: 'Short for "else if". Checks another condition if the previous was False.' },
        { label: 'else', desc: 'Runs if ALL above conditions were False. The "catch-all" block.' },
        { label: 'Ternary', desc: 'value_if_true if condition else value_if_false — one-liner shorthand.' },
      ],
      code: `# ── Basic if ─────────────────────────────
age = 18
if age >= 18:
    print("You are an adult")
    print("You can vote!")

# ── if-else ───────────────────────────────
temperature = 15
if temperature > 25:
    print("It's hot — wear a t-shirt!")
else:
    print("It's cool — bring a jacket!")

# ── if-elif-else ──────────────────────────
score = 72
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"
print(f"Your grade: {grade}")  # C

# ── Nested conditions ─────────────────────
is_member = True
balance = 150
if is_member:
    if balance >= 100:
        print("Purchase approved!")
    else:
        print("Insufficient balance")
else:
    print("Please sign up first")

# ── Ternary (one-liner) ───────────────────
age = 20
status = "adult" if age >= 18 else "minor"
print(status)   # adult`,
      quiz: {
        question: 'If score = 85, which branch runs in: if score>=90: ... elif score>=80: ... else: ...?',
        options: ['The if block', 'The elif block', 'The else block', 'None of them'],
        answer: 1,
        explanation: '85 is NOT ≥ 90, so the if block is skipped. Then 85 IS ≥ 80, so the elif block runs. Python checks conditions top to bottom and runs the FIRST one that\'s True.',
      },
      challenge: {
        title: 'The Grade Calculator',
        description: 'Write a program that takes a score (assign any integer between 0–100) and prints a detailed message: the letter grade (A/B/C/D/F), whether the student passed or failed (pass = score ≥ 60), and a motivational message based on the grade.',
        hint: 'Use if-elif-else for grade. Then use another if-else for pass/fail.',
        example: `score = 78
if score >= 90:
    grade = "A"
    message = "Outstanding!"
elif score >= 80:
    grade = "B"
    message = "Great work!"
elif score >= 70:
    grade = "C"
    message = "Good job!"
elif score >= 60:
    grade = "D"
    message = "You passed!"
else:
    grade = "F"
    message = "Keep trying!"
passed = "Passed" if score >= 60 else "Failed"
print(f"Grade: {grade} | Status: {passed}")
print(message)`,
      },
    },
    {
      id: 'py-b-7',
      title: 'Loops — for & while',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Why do we need loops?' },
        { time: '1:00', label: 'The for loop and range()' },
        { time: '3:00', label: 'Iterating over lists and strings' },
        { time: '4:30', label: 'The while loop' },
        { time: '6:00', label: 'break and continue' },
        { time: '7:30', label: 'enumerate() and zip()' },
      ],
      theory: `**Loops** let you repeat a block of code multiple times without writing it out over and over. They're one of the most powerful tools in any language.

The **for loop** is used when you know in advance how many times to repeat, or when you want to iterate over a collection (list, string, range, etc.).

The **while loop** keeps running as long as a condition is True — used when you don't know in advance how many repetitions you'll need.

**break** immediately exits the loop. **continue** skips the current iteration and jumps to the next one.`,
      concepts: [
        { label: 'range()', desc: 'Generates a sequence of numbers. range(5) → 0,1,2,3,4. range(2,8,2) → 2,4,6.' },
        { label: 'enumerate()', desc: 'Gives you both index AND value while iterating — very Pythonic.' },
        { label: 'break', desc: 'Exits the loop immediately, even if condition is still True.' },
        { label: 'continue', desc: 'Skips the rest of this iteration and goes to the next one.' },
      ],
      code: `# ── for loop with range() ────────────────
for i in range(5):
    print(i)        # 0 1 2 3 4

for i in range(1, 6):
    print(i)        # 1 2 3 4 5

for i in range(0, 10, 2):
    print(i)        # 0 2 4 6 8 (step of 2)

# ── Iterating over a list ─────────────────
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"I like {fruit}")

# ── enumerate — index + value ─────────────
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

# ── while loop ────────────────────────────
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1          # IMPORTANT: avoid infinite loops!

# ── break and continue ────────────────────
for i in range(10):
    if i == 6:
        break           # Stop entirely at 6
    if i % 2 == 0:
        continue        # Skip even numbers
    print(i)            # prints 1 3 5

# ── zip — iterate two lists together ──────
names = ["Alice", "Bob", "Carol"]
scores = [95, 82, 78]
for name, score in zip(names, scores):
    print(f"{name}: {score}")`,
      quiz: {
        question: 'What does range(2, 10, 3) produce?',
        options: ['2, 5, 8', '2, 3, 4, 5, 6, 7, 8, 9, 10', '3, 6, 9', '2, 4, 6, 8'],
        answer: 0,
        explanation: 'range(start, stop, step) starts at 2, stops BEFORE 10, increments by 3 each time. So: 2, 2+3=5, 5+3=8. Next would be 11 which is ≥ 10, so we stop. Result: 2, 5, 8.',
      },
      challenge: {
        title: 'Multiplication Table Generator',
        description: 'Write a program that prints a complete multiplication table for the number 7, from 7×1 to 7×12. Then use a while loop to calculate and print the sum of all even numbers from 1 to 50.',
        hint: 'Use range(1, 13) for the table. For the sum, use a while loop with count += 2 or check if count % 2 == 0.',
        example: `# Multiplication table
for i in range(1, 13):
    print(f"7 × {i} = {7 * i}")

# Sum of even numbers 1-50
total = 0
n = 2
while n <= 50:
    total += n
    n += 2
print(f"Sum of evens 1-50: {total}")`,
      },
    },
    {
      id: 'py-b-8',
      title: 'Functions',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Why functions?' },
        { time: '1:15', label: 'Defining and calling a function' },
        { time: '2:45', label: 'Parameters and arguments' },
        { time: '4:20', label: 'The return statement' },
        { time: '5:50', label: 'Default parameters' },
        { time: '7:10', label: 'Scope — local vs global' },
      ],
      theory: `A **function** is a named, reusable block of code that performs a specific task. Instead of writing the same code over and over, you write it once as a function and call it whenever you need it.

Functions are the building blocks of all programs. They make code:
- **Reusable** — write once, use many times
- **Readable** — a well-named function explains what it does
- **Testable** — test each piece independently
- **Maintainable** — fix a bug in one place, it's fixed everywhere

The **return** statement sends a value back to the caller. Without return, the function returns None.`,
      concepts: [
        { label: 'def', desc: 'Keyword to define a function. def function_name(parameters):' },
        { label: 'Parameters', desc: 'Variable names in the function definition — the "inputs" it expects.' },
        { label: 'Arguments', desc: 'Actual values passed when calling the function.' },
        { label: 'return', desc: 'Sends a value back to the caller and exits the function immediately.' },
      ],
      code: `# ── Defining a basic function ─────────────
def greet():
    print("Hello! Welcome to Python!")

greet()     # Calling the function

# ── With parameters ───────────────────────
def greet_person(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet_person("Alice")              # Hello, Alice!
greet_person("Bob", "Good morning") # Good morning, Bob!

# ── Returning values ──────────────────────
def add(a, b):
    return a + b

result = add(10, 5)
print(result)           # 15
print(add(3.14, 2.86))  # 6.0

# ── Multiple return values ────────────────
def min_max(numbers):
    return min(numbers), max(numbers)

lowest, highest = min_max([3, 1, 9, 2, 7])
print(f"Min: {lowest}, Max: {highest}")

# ── Practical function ────────────────────
def calculate_bmi(weight_kg, height_m):
    bmi = weight_kg / (height_m ** 2)
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"
    return round(bmi, 1), category

bmi, cat = calculate_bmi(70, 1.75)
print(f"BMI: {bmi} — {cat}")`,
      quiz: {
        question: 'What does a function return if there is no return statement?',
        options: ['0', '""  (empty string)', 'None', 'An error is raised'],
        answer: 2,
        explanation: 'In Python, every function returns something. If you don\'t have a return statement (or just write return with no value), Python automatically returns None — a special value meaning "no value".',
      },
      challenge: {
        title: 'The Function Library',
        description: 'Create three functions: (1) is_even(n) — returns True if n is even, False otherwise. (2) celsius_to_fahrenheit(c) — converts Celsius to Fahrenheit (formula: F = C × 9/5 + 32). (3) count_vowels(text) — returns how many vowels (a,e,i,o,u) are in the text. Test each function with 2 different inputs.',
        hint: 'For vowels, loop through each character and check if it\'s in "aeiou". For even, use the % operator.',
        example: `def is_even(n):
    return n % 2 == 0

def celsius_to_fahrenheit(c):
    return c * 9/5 + 32

def count_vowels(text):
    count = 0
    for char in text.lower():
        if char in "aeiou":
            count += 1
    return count

print(is_even(4))
print(celsius_to_fahrenheit(100))
print(count_vowels("Hello World"))`,
      },
    },
  ],

  intermediate: [
    {
      id: 'py-i-1',
      title: 'Dictionaries',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'What is a dictionary?' },
        { time: '1:30', label: 'Creating and accessing dicts' },
        { time: '3:00', label: 'Adding, updating, deleting keys' },
        { time: '4:30', label: 'Iterating over dicts' },
        { time: '6:00', label: 'Dict methods — get, keys, values, items' },
        { time: '7:30', label: 'Nested dictionaries' },
      ],
      theory: `A **dictionary** stores data as key-value pairs — like a real dictionary where each word (key) has a definition (value). Dictionaries are unordered (in older Python), but from Python 3.7+ they maintain insertion order.

Dictionaries are incredibly fast for lookups — finding a value by key is O(1) regardless of dictionary size. They're the go-to data structure for storing structured data like user profiles, settings, API responses, and database records.

Keys must be **immutable** (strings, numbers, or tuples). Values can be anything — including other dictionaries (nesting).`,
      concepts: [
        { label: 'Key-value pair', desc: '"name": "Alice" — the key is "name", the value is "Alice".' },
        { label: 'get()', desc: 'Safely retrieves a value. Returns None (or default) if key missing — no error.' },
        { label: 'items()', desc: 'Returns all key-value pairs as tuples — great for iterating.' },
        { label: 'Nesting', desc: 'A dict can contain other dicts — model complex real-world data.' },
      ],
      code: `# ── Creating Dictionaries ────────────────
person = {
    "name": "Alice",
    "age": 25,
    "city": "Mumbai",
    "is_student": True
}

# ── Accessing Values ──────────────────────
print(person["name"])        # Alice
print(person.get("age"))     # 25
print(person.get("email", "Not set"))  # Not set (no error!)

# ── Modifying ─────────────────────────────
person["age"] = 26             # Update existing
person["email"] = "a@ex.com"  # Add new key
del person["city"]             # Delete key
print(person)

# ── Iterating ─────────────────────────────
for key in person.keys():
    print(key)

for value in person.values():
    print(value)

for key, value in person.items():
    print(f"  {key}: {value}")

# ── Useful Methods ────────────────────────
print("name" in person)      # True — key exists?
print(len(person))           # number of key-value pairs
person.pop("email")          # remove and return value

# ── Nested Dictionaries ───────────────────
users = {
    "alice": {"age": 25, "score": 95},
    "bob":   {"age": 30, "score": 82},
}
print(users["alice"]["score"])  # 95

for username, data in users.items():
    print(f"{username}: score={data['score']}")`,
      quiz: {
        question: 'What does dict.get("missing_key") return if the key doesn\'t exist?',
        options: ['Raises a KeyError', '0', 'False', 'None'],
        answer: 3,
        explanation: 'Unlike dict["key"] which raises KeyError for missing keys, .get() returns None by default. You can also provide a custom default: dict.get("key", "default_value") — very useful for safe lookups!',
      },
      challenge: {
        title: 'Student Database',
        description: 'Create a dictionary called students where each key is a student name and the value is another dictionary containing "grade" (A/B/C), "age", and "passed" (True/False). Add at least 3 students. Then: print each student\'s name and grade, count how many students passed, and find the youngest student.',
        hint: 'Iterate with .items() to access both name and data. Use a variable to track count of passed.',
        example: `students = {
    "Alice": {"grade": "A", "age": 20, "passed": True},
    "Bob": {"grade": "C", "age": 22, "passed": True},
    "Carol": {"grade": "F", "age": 21, "passed": False},
}
passed_count = 0
for name, data in students.items():
    print(f"{name}: {data['grade']}")
    if data["passed"]:
        passed_count += 1
print(f"Passed: {passed_count}")`,
      },
    },
    {
      id: 'py-i-2',
      title: 'Object-Oriented Programming',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'What is OOP and why does it matter?' },
        { time: '1:30', label: 'Classes and objects' },
        { time: '3:15', label: 'The __init__ constructor' },
        { time: '5:00', label: 'Methods — instance methods' },
        { time: '6:30', label: 'Inheritance and super()' },
        { time: '8:30', label: 'Encapsulation — public vs private' },
      ],
      theory: `**Object-Oriented Programming (OOP)** organises code around **objects** — bundles of data (attributes) and behaviour (methods) that model real-world things.

Think of a **class** as a blueprint — like an architect's plan. An **object** is the actual building built from that plan. You can create many objects from one class, each with different data but the same structure.

OOP's four pillars are:
- **Encapsulation** — hide internal details, expose a clean interface
- **Inheritance** — a child class reuses and extends a parent class
- **Polymorphism** — same method name, different behaviour in subclasses
- **Abstraction** — simplify complex systems by showing only what's needed`,
      concepts: [
        { label: '__init__', desc: 'The constructor — runs automatically when an object is created.' },
        { label: 'self', desc: 'Refers to the current object instance. Always first parameter of methods.' },
        { label: 'Inheritance', desc: 'class Child(Parent): — Child gets all of Parent\'s methods and attributes.' },
        { label: 'super()', desc: 'Calls the parent class\'s method from inside the child class.' },
      ],
      code: `# ── Defining a Class ─────────────────────
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        self._transactions = []   # "private" by convention

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            self._transactions.append(f"+{amount}")
            return True
        return False

    def withdraw(self, amount):
        if 0 < amount <= self.balance:
            self.balance -= amount
            self._transactions.append(f"-{amount}")
            return True
        print("Insufficient funds!")
        return False

    def get_statement(self):
        return f"Account: {self.owner} | Balance: ₹{self.balance}"

# ── Creating Objects ──────────────────────
acc1 = BankAccount("Alice", 1000)
acc2 = BankAccount("Bob")

acc1.deposit(500)
acc1.withdraw(200)
print(acc1.get_statement())  # Balance: ₹1300

# ── Inheritance ───────────────────────────
class SavingsAccount(BankAccount):
    def __init__(self, owner, balance=0, interest_rate=0.05):
        super().__init__(owner, balance)
        self.interest_rate = interest_rate

    def add_interest(self):
        interest = self.balance * self.interest_rate
        self.deposit(interest)
        print(f"Interest added: ₹{interest:.2f}")

savings = SavingsAccount("Carol", 10000, 0.08)
savings.add_interest()
print(savings.get_statement())`,
      quiz: {
        question: 'What is the purpose of __init__ in a Python class?',
        options: [
          'It\'s called when the object is deleted',
          'It initialises the object\'s attributes when created',
          'It\'s a required method with no special purpose',
          'It makes the class inherit from another',
        ],
        answer: 1,
        explanation: '__init__ is the constructor — it runs automatically every time you create a new object from the class (like BankAccount("Alice")). It\'s where you set up the object\'s initial state by assigning attributes using self.',
      },
      challenge: {
        title: 'Build a Library System',
        description: 'Create a Book class with attributes: title, author, year, and is_borrowed (default False). Add methods: borrow() which sets is_borrowed to True and prints a message (but only if not already borrowed), return_book() which sets is_borrowed to False, and info() which prints all details. Create 2 Book objects and test all methods.',
        hint: 'Check if is_borrowed is True before allowing borrow(). Use self.is_borrowed to track state.',
        example: `class Book:
    def __init__(self, title, author, year):
        self.title = title
        self.author = author
        self.year = year
        self.is_borrowed = False

    def borrow(self):
        if not self.is_borrowed:
            self.is_borrowed = True
            print(f"'{self.title}' borrowed!")
        else:
            print("Already borrowed!")

    def return_book(self):
        self.is_borrowed = False
        print(f"'{self.title}' returned!")

    def info(self):
        status = "Borrowed" if self.is_borrowed else "Available"
        print(f"{self.title} by {self.author} ({self.year}) — {status}")`,
      },
    },
    {
      id: 'py-i-3',
      title: 'File Handling & Exceptions',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Reading and writing files' },
        { time: '2:15', label: 'The with statement (context manager)' },
        { time: '3:45', label: 'try / except — handling errors' },
        { time: '5:30', label: 'Multiple exception types' },
        { time: '6:45', label: 'finally and raising exceptions' },
      ],
      theory: `Programs must handle the real world gracefully — files might not exist, networks can fail, users can input wrong values. **Exception handling** prevents crashes and gives users helpful error messages.

**File I/O** lets your program persist data beyond a single run. Python's built-in open() function handles reading and writing files. The \`with\` statement is the modern, safe way to work with files — it automatically closes the file even if an error occurs.

**Try/except** blocks catch errors and handle them cleanly. This is called "defensive programming" — assume things can go wrong, and plan for it.`,
      concepts: [
        { label: 'try', desc: 'Code that might raise an exception goes here.' },
        { label: 'except', desc: 'Runs if the specified exception occurs in the try block.' },
        { label: 'finally', desc: 'Always runs — whether or not an exception occurred. For cleanup.' },
        { label: 'with open()', desc: 'Context manager — opens file, runs block, automatically closes file.' },
      ],
      code: `# ── Writing to a file ────────────────────
with open("notes.txt", "w") as f:
    f.write("Hello, file world!\\n")
    f.write("Python file I/O is easy.\\n")

# ── Reading from a file ───────────────────
with open("notes.txt", "r") as f:
    content = f.read()
    print(content)

# Read line by line
with open("notes.txt", "r") as f:
    for line in f:
        print(line.strip())

# Append to a file
with open("notes.txt", "a") as f:
    f.write("Adding another line.\\n")

# ── Exception Handling ────────────────────
try:
    number = int("not a number")   # Will fail
except ValueError as e:
    print(f"ValueError: {e}")

# ── Multiple exceptions ───────────────────
def safe_divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        print("Error: Cannot divide by zero!")
        return None
    except TypeError:
        print("Error: Both inputs must be numbers!")
        return None
    finally:
        print("Division attempted.")

print(safe_divide(10, 2))    # 5.0
print(safe_divide(10, 0))    # Error!

# ── Raising custom exceptions ─────────────
def set_age(age):
    if age < 0 or age > 150:
        raise ValueError(f"Invalid age: {age}")
    return age

try:
    set_age(-5)
except ValueError as e:
    print(e)`,
      quiz: {
        question: 'Which block ALWAYS runs, whether or not an exception occurred?',
        options: ['try', 'except', 'else', 'finally'],
        answer: 3,
        explanation: 'finally always executes — it\'s used for cleanup tasks like closing files, releasing resources, or logging. Even if the try block raises an exception and the except block re-raises it, finally still runs.',
      },
      challenge: {
        title: 'Safe Calculator with Logging',
        description: 'Write a function safe_calculator(a, operator, b) that: (1) Handles division by zero, (2) Handles invalid types with TypeError, (3) Supports +, -, *, / operators, (4) Raises ValueError for unknown operators. Test it with valid inputs, division by zero, and an invalid operator — all inside try/except blocks.',
        hint: 'Use a dictionary to map operators to operations. Check if operator is in the dict first.',
        example: `def safe_calculator(a, operator, b):
    ops = {"+": a+b, "-": a-b, "*": a*b}
    if operator == "/":
        if b == 0:
            raise ZeroDivisionError("Can't divide by 0")
        return a / b
    if operator not in ops:
        raise ValueError(f"Unknown operator: {operator}")
    return ops[operator]

try:
    print(safe_calculator(10, "/", 0))
except ZeroDivisionError as e:
    print(e)`,
      },
    },
  ],

  expert: [
    {
      id: 'py-e-1',
      title: 'Decorators',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'First-class functions — the foundation' },
        { time: '2:00', label: 'Closures and nested functions' },
        { time: '4:00', label: 'Building your first decorator' },
        { time: '6:00', label: 'The @syntax sugar' },
        { time: '7:30', label: 'Practical decorators — timer, logger, cache' },
      ],
      theory: `**Decorators** are one of Python's most elegant and powerful features. A decorator is a function that takes another function as input, adds some behaviour to it, and returns the modified function — all without changing the original function's source code.

This is made possible because Python treats functions as **first-class objects** — they can be passed as arguments, returned from other functions, and assigned to variables.

Decorators are used everywhere in real Python code: web frameworks (Flask's @app.route), Django's @login_required, caching, logging, access control, timing, retry logic, and much more.`,
      concepts: [
        { label: 'First-class functions', desc: 'Functions are objects — they can be stored in variables and passed around.' },
        { label: 'Closure', desc: 'A function that remembers variables from its enclosing scope.' },
        { label: 'wrapper()', desc: 'The inner function inside a decorator that adds the new behaviour.' },
        { label: 'functools.wraps', desc: 'Preserves the original function\'s name and docstring after decorating.' },
      ],
      code: `import time
import functools

# ── First-class functions ─────────────────
def say_hi():
    return "Hi!"

greet = say_hi          # function as variable
print(greet())          # Hi!

def run_func(func):
    return func()       # function as argument

print(run_func(say_hi)) # Hi!

# ── Building a Decorator ──────────────────
def timer(func):
    @functools.wraps(func)   # preserves __name__
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"⏱ {func.__name__} took {end-start:.4f}s")
        return result
    return wrapper

@timer
def slow_sum(n):
    """Returns sum of 1 to n."""
    return sum(range(n))

print(slow_sum(1_000_000))

# ── Logger Decorator ──────────────────────
def logger(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with args={args}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

@logger
@timer  # Multiple decorators — applied bottom-up!
def add(a, b):
    return a + b

add(3, 5)`,
      quiz: {
        question: 'In what order are stacked decorators applied? e.g. @A on top of @B on a function f',
        options: ['A first, then B', 'B first, then A', 'Simultaneously', 'The order doesn\'t matter'],
        answer: 1,
        explanation: 'Decorators apply from bottom to top (closest to the function first). @A @B def f() means B is applied first: B(f), then A wraps the result: A(B(f)). So when you CALL the function, A\'s code runs first (outermost).',
      },
      challenge: {
        title: 'The Authentication Decorator',
        description: 'Create a decorator requires_auth that wraps a function and: (1) Checks if a global variable is_logged_in is True before running the function, (2) If not logged in, prints "Access denied — please log in" and returns None, (3) If logged in, runs the function normally. Apply it to two functions: view_dashboard() and view_profile(). Test both with is_logged_in = False and then True.',
        hint: 'The decorator checks is_logged_in inside wrapper(). Use global is_logged_in to access the global.',
        example: `is_logged_in = False

def requires_auth(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if not is_logged_in:
            print("Access denied!")
            return None
        return func(*args, **kwargs)
    return wrapper

@requires_auth
def view_dashboard():
    print("Welcome to your dashboard!")`,
      },
    },
    {
      id: 'py-e-2',
      title: 'Generators & Async/Await',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Memory problem with large data' },
        { time: '1:30', label: 'Generators and the yield keyword' },
        { time: '3:30', label: 'Generator expressions' },
        { time: '5:00', label: 'What is asynchronous programming?' },
        { time: '6:30', label: 'async def and await' },
        { time: '8:00', label: 'asyncio.gather — concurrent tasks' },
      ],
      theory: `**Generators** solve the memory problem of working with large datasets. Instead of creating a full list in memory, generators produce values one at a time — only when requested. This is called **lazy evaluation**.

**Async/Await** solves the waiting problem. Traditional programs wait for each operation to finish before starting the next. Async allows your program to start multiple I/O operations and switch between them while waiting — dramatically improving performance for network-heavy applications.

Together, these are two of the most important advanced Python concepts for building scalable, efficient applications.`,
      concepts: [
        { label: 'yield', desc: 'Pauses function execution and sends a value to the caller. Resumes on next call.' },
        { label: 'Lazy evaluation', desc: 'Values computed only when needed — saves memory for huge datasets.' },
        { label: 'async def', desc: 'Defines a coroutine — a function that can be paused and resumed.' },
        { label: 'await', desc: 'Pauses the coroutine until the awaited operation completes. Non-blocking.' },
      ],
      code: `import asyncio

# ── Generators ────────────────────────────
def count_up(limit):
    """Generates numbers from 0 to limit-1"""
    n = 0
    while n < limit:
        yield n        # pause, send n, resume later
        n += 1

gen = count_up(5)
print(next(gen))   # 0
print(next(gen))   # 1

for num in count_up(5):
    print(num)     # 0 1 2 3 4

# Memory comparison
import sys
big_list = [x**2 for x in range(100_000)]   # List
big_gen  = (x**2 for x in range(100_000))   # Generator
print(f"List:      {sys.getsizeof(big_list):,} bytes")
print(f"Generator: {sys.getsizeof(big_gen)} bytes")

# Infinite generator (safe because lazy!)
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
for _ in range(10):
    print(next(fib), end=" ")  # 0 1 1 2 3 5 8 13 21 34

# ── Async / Await ─────────────────────────
async def fetch_data(source, delay):
    print(f"Fetching from {source}...")
    await asyncio.sleep(delay)   # non-blocking wait
    return f"Data from {source}"

async def main():
    # Sequential — slow
    # r1 = await fetch_data("API-1", 2)
    # r2 = await fetch_data("API-2", 2)

    # Concurrent — fast! Both run simultaneously
    r1, r2, r3 = await asyncio.gather(
        fetch_data("API-1", 1),
        fetch_data("API-2", 1.5),
        fetch_data("API-3", 0.5),
    )
    print(r1, r2, r3)

asyncio.run(main())`,
      quiz: {
        question: 'What is the key memory advantage of a generator over a list?',
        options: [
          'Generators are always faster to iterate',
          'Generators store all values in RAM for fast access',
          'Generators produce values one at a time — only when needed',
          'Generators can hold more items than lists',
        ],
        answer: 2,
        explanation: 'Generators use lazy evaluation — they produce values one at a time only when requested, keeping only the current value in memory. A list of 1 million numbers might use 8MB, while a generator for the same sequence uses only ~200 bytes!',
      },
      challenge: {
        title: 'Data Pipeline with Generators',
        description: 'Build a data pipeline using generators: (1) read_numbers(n) — yields numbers 1 to n, (2) square(gen) — takes a generator and yields each value squared, (3) filter_even(gen) — yields only even values from a generator. Chain them together: read_numbers(20) → square → filter_even, and print the results. This is how real data pipelines process millions of records!',
        hint: 'Each generator takes another generator as input. Chain them: filter_even(square(read_numbers(20)))',
        example: `def read_numbers(n):
    for i in range(1, n+1):
        yield i

def square(gen):
    for val in gen:
        yield val ** 2

def filter_even(gen):
    for val in gen:
        if val % 2 == 0:
            yield val

pipeline = filter_even(square(read_numbers(20)))
for result in pipeline:
    print(result)`,
      },
    },
  ],
};

// ─── JAVASCRIPT ───────────────────────────────
const javascriptLessons = {
  beginner: [
    {
      id: 'js-b-1',
      title: 'Welcome to JavaScript',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'What is JavaScript?' },
        { time: '1:15', label: 'JS in the browser vs Node.js' },
        { time: '2:30', label: 'Your first JS program' },
        { time: '3:45', label: 'let, const, and var' },
        { time: '5:00', label: 'console.log and alert' },
      ],
      theory: `**JavaScript** is the only programming language that runs natively in web browsers — making it the language of the internet. Every interactive website, from Google Maps to Instagram, uses JavaScript to respond to user actions, fetch data, and update the page without reloading.

JavaScript was created in just 10 days in 1995 by Brendan Eich at Netscape. Despite its rushed origin, it has grown into one of the world's most widely used languages — powering both the frontend (browser) and backend (Node.js) of web applications.

Today, JavaScript has evolved tremendously. ES6+ (ECMAScript 2015 and later) introduced modern, clean syntax — arrow functions, classes, destructuring, modules — which is what we'll use throughout this course.`,
      concepts: [
        { label: 'let', desc: 'Declares a block-scoped variable that can be reassigned.' },
        { label: 'const', desc: 'Declares a block-scoped constant — cannot be reassigned.' },
        { label: 'var', desc: 'Old-style declaration. Avoid in modern code — use let/const.' },
        { label: 'console.log', desc: 'Prints output to the browser/Node.js console. Your #1 debugging tool.' },
      ],
      code: `// Your first JavaScript program!
console.log("Hello, World!");

// ── Variables ──────────────────────────
let name = "Alice";           // can reassign
const PI = 3.14159;           // cannot reassign
// var age = 25;              // avoid — use let/const

// ── Data Types ────────────────────────
let text    = "Hello";        // String
let number  = 42;             // Number (int + float unified)
let decimal = 3.14;           // Also Number
let bool    = true;           // Boolean
let nothing = null;           // Null
let undef;                    // Undefined (not yet assigned)

// ── Template literals (backtick strings)
let city = "Mumbai";
console.log(\`Hello from \${city}!\`);
console.log(\`PI is approximately \${PI.toFixed(2)}\`);

// ── typeof — check data type
console.log(typeof text);    // "string"
console.log(typeof number);  // "number"
console.log(typeof bool);    // "boolean"
console.log(typeof undef);   // "undefined"
console.log(typeof null);    // "object" — famous JS quirk!`,
      quiz: {
        question: 'Which keyword should you use to declare a variable that will NOT change?',
        options: ['var', 'let', 'const', 'fixed'],
        answer: 2,
        explanation: 'const declares a constant — a variable whose binding cannot be reassigned. Use const by default, and only use let when you need to reassign the variable. Avoid var in modern JS as it has confusing scope behaviour.',
      },
      challenge: {
        title: 'Your JS Profile Card',
        description: 'Declare const and let variables for: your name, age, city, favourite colour, and whether you are a developer (boolean). Then use template literals to log a formatted sentence: "Hi, I\'m [name], a [age]-year-old developer from [city]. My favourite colour is [colour]."',
        hint: 'Use backticks ` ` and ${variable} for template literals.',
        example: `const name = "Alice";
const age = 22;
const city = "Delhi";
const favColour = "blue";
const isDeveloper = true;

console.log(\`Hi, I'm \${name}, a \${age}-year-old \${isDeveloper ? "developer" : "learner"} from \${city}. My favourite colour is \${favColour}.\`);`,
      },
    },
    {
      id: 'js-b-2',
      title: 'Arrays & Array Methods',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Creating and accessing arrays' },
        { time: '1:30', label: 'push, pop, shift, unshift' },
        { time: '3:00', label: 'map — transform every item' },
        { time: '4:30', label: 'filter — keep matching items' },
        { time: '6:00', label: 'reduce — boil down to one value' },
        { time: '7:30', label: 'find, includes, indexOf' },
      ],
      theory: `Arrays in JavaScript are ordered lists — like Python's lists. But what makes JS arrays truly powerful are the **higher-order array methods**: map, filter, and reduce.

These three methods are the backbone of modern JavaScript development. They allow you to transform data functionally — creating new arrays without mutating the original — leading to cleaner, more predictable code.

Mastering these methods is arguably the single most important skill for a JavaScript developer. They're used constantly in React apps, data processing, API responses, and virtually every modern JS codebase.`,
      concepts: [
        { label: 'map()', desc: 'Transforms every element and returns a NEW array of the same length.' },
        { label: 'filter()', desc: 'Keeps only elements where the callback returns true. Returns a NEW array.' },
        { label: 'reduce()', desc: 'Boils an array down to a single value using an accumulator.' },
        { label: 'Immutability', desc: 'map/filter/reduce don\'t change the original array — they return new ones.' },
      ],
      code: `// ── Creating Arrays ──────────────────────
const fruits = ["apple", "banana", "cherry"];
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, "hello", true, null];

// ── Accessing ─────────────────────────────
console.log(fruits[0]);       // apple
console.log(fruits.at(-1));   // cherry (last — modern way)
console.log(fruits.length);   // 3

// ── Mutating Methods ──────────────────────
fruits.push("mango");         // add to END
fruits.pop();                 // remove from END
fruits.unshift("grape");      // add to START
fruits.shift();               // remove from START

// ── map — transform each element ──────────
const doubled = numbers.map(n => n * 2);
console.log(doubled);         // [2,4,6,8,10]

const upperFruits = fruits.map(f => f.toUpperCase());
console.log(upperFruits);

// ── filter — keep matching elements ───────
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);           // [2,4]

const longFruits = fruits.filter(f => f.length > 5);
console.log(longFruits);

// ── reduce — collapse to one value ─────────
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);     // 15

// ── Chain methods together! ───────────────
const result = [1,2,3,4,5,6,7,8,9,10]
  .filter(n => n % 2 === 0)   // [2,4,6,8,10]
  .map(n => n ** 2)            // [4,16,36,64,100]
  .reduce((acc,n) => acc + n, 0); // 220
console.log(result);`,
      quiz: {
        question: 'What does [1,2,3,4,5].filter(n => n > 3) return?',
        options: ['[1,2,3]', '[3,4,5]', '[4,5]', '[true,true]'],
        answer: 2,
        explanation: 'filter() keeps only elements where the callback returns true. n > 3 is true for 4 and 5 only. So the result is [4, 5]. Note: it returns a NEW array — the original [1,2,3,4,5] is unchanged.',
      },
      challenge: {
        title: 'Data Transformation Pipeline',
        description: 'You have an array of product objects: [{name:"Apple",price:50,inStock:true},{name:"Banana",price:30,inStock:false},{name:"Cherry",price:120,inStock:true},{name:"Mango",price:80,inStock:true}]. Using ONLY map, filter, and reduce (no loops!): (1) Filter to in-stock items only, (2) Get an array of just their names in uppercase, (3) Calculate the total price of all in-stock items.',
        hint: 'Chain: products.filter(...).map(...). For total, use a separate reduce on the filtered array.',
        example: `const products = [
  {name:"Apple",price:50,inStock:true},
  {name:"Banana",price:30,inStock:false},
  {name:"Cherry",price:120,inStock:true},
  {name:"Mango",price:80,inStock:true},
];
const inStock = products.filter(p => p.inStock);
const names = inStock.map(p => p.name.toUpperCase());
const total = inStock.reduce((acc,p) => acc + p.price, 0);
console.log(names);
console.log("Total:", total);`,
      },
    },
    {
      id: 'js-b-3',
      title: 'Functions & Arrow Functions',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Function declarations' },
        { time: '1:30', label: 'Function expressions' },
        { time: '2:45', label: 'Arrow functions — concise syntax' },
        { time: '4:15', label: 'Default parameters' },
        { time: '5:30', label: 'Rest parameters and spread operator' },
        { time: '7:00', label: 'Closures' },
      ],
      theory: `JavaScript has multiple ways to write functions — each with its own use cases. Understanding when to use each is key to writing idiomatic modern JavaScript.

**Arrow functions** (introduced in ES6) are the most concise form and are the standard in modern code, especially for callbacks. However, they behave differently from regular functions in one important way: they don't have their own \`this\` context — they inherit it from the surrounding scope.

**Closures** are one of JavaScript's most powerful (and initially confusing) features. A closure is when a function "remembers" variables from its outer scope even after that scope has finished executing.`,
      concepts: [
        { label: 'Arrow function', desc: 'const fn = (x) => x * 2; — concise, no own `this`.' },
        { label: 'Default params', desc: 'function f(x, y=10) — y defaults to 10 if not provided.' },
        { label: 'Rest params', desc: '...args collects remaining arguments into an array.' },
        { label: 'Closure', desc: 'Inner function remembers variables from outer function\'s scope.' },
      ],
      code: `// ── Function Declaration ─────────────────
function greet(name) {
  return \`Hello, \${name}!\`;
}

// ── Function Expression ───────────────────
const greet2 = function(name) {
  return \`Hello, \${name}!\`;
};

// ── Arrow Functions ───────────────────────
const greet3 = (name) => \`Hello, \${name}!\`;
const double = n => n * 2;                  // single param
const add = (a, b) => a + b;               // two params
const getObj = () => ({ key: "value" });   // returning object

console.log(greet3("Alice"));
console.log(double(5));      // 10
console.log(add(3, 4));      // 7

// ── Default Parameters ────────────────────
const power = (base, exp = 2) => base ** exp;
console.log(power(3));    // 9  — exp defaults to 2
console.log(power(2, 8)); // 256

// ── Rest Parameters ───────────────────────
const sum = (...numbers) => numbers.reduce((a,b) => a+b, 0);
console.log(sum(1,2,3,4,5));  // 15

// ── Spread Operator ───────────────────────
const arr1 = [1,2,3];
const arr2 = [4,5,6];
const combined = [...arr1, ...arr2];
console.log(combined);    // [1,2,3,4,5,6]

// ── Closures ──────────────────────────────
function makeCounter(start = 0) {
  let count = start;   // remembered by inner function
  return {
    increment: () => ++count,
    decrement: () => --count,
    value:     () => count,
  };
}
const counter = makeCounter(10);
counter.increment();
counter.increment();
counter.decrement();
console.log(counter.value()); // 11`,
      quiz: {
        question: 'What does const square = n => n ** 2; do when called as square(5)?',
        options: ['Returns 25', 'Returns 10', 'Returns "n ** 2"', 'Throws an error'],
        answer: 0,
        explanation: 'This is an arrow function that takes one parameter n and implicitly returns n**2 (the expression after =>). When called with 5, it returns 5**2 = 25. Arrow functions with a single expression body have an implicit return — no need for the return keyword or curly braces.',
      },
      challenge: {
        title: 'Function Factory',
        description: 'Create a function makeMultiplier(factor) that returns a NEW function — the returned function takes a number and multiplies it by factor. Use this to create: double (factor=2), triple (factor=3), tenX (factor=10). Test each one. Then create a makeGreeter(greeting) that returns a function taking a name and returning a personalised greeting string.',
        hint: 'makeMultiplier returns an arrow function that uses factor from its closure.',
        example: `const makeMultiplier = (factor) => (n) => n * factor;
const double = makeMultiplier(2);
const triple = makeMultiplier(3);
console.log(double(5));  // 10
console.log(triple(5));  // 15

const makeGreeter = (greeting) => (name) => \`\${greeting}, \${name}!\`;
const sayHello = makeGreeter("Hello");
console.log(sayHello("Alice"));`,
      },
    },
  ],
  intermediate: [
    {
      id: 'js-i-1',
      title: 'Promises & Async/Await',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'The problem: callback hell' },
        { time: '1:30', label: 'What is a Promise?' },
        { time: '3:00', label: '.then() and .catch()' },
        { time: '4:30', label: 'async/await — cleaner syntax' },
        { time: '6:00', label: 'Promise.all — parallel execution' },
        { time: '7:30', label: 'Error handling with try/catch' },
      ],
      theory: `JavaScript is **single-threaded** — it can only do one thing at a time. But web apps constantly need to do slow things: fetch data from APIs, read files, wait for user input. Doing these synchronously would freeze the browser.

The solution is **asynchronous programming**. JavaScript uses an event loop to start operations, do other work while waiting, and come back when results are ready.

**Promises** represent a value that isn't available yet but will be in the future. **Async/await** is syntactic sugar on top of Promises — it lets you write asynchronous code that reads like synchronous code, making it far easier to reason about.`,
      concepts: [
        { label: 'Promise', desc: 'An object representing an eventual success (resolve) or failure (reject).' },
        { label: 'async', desc: 'Makes a function return a Promise automatically.' },
        { label: 'await', desc: 'Pauses execution inside async function until Promise resolves.' },
        { label: 'Promise.all()', desc: 'Runs multiple promises in PARALLEL — waits for ALL to complete.' },
      ],
      code: `// ── Creating a Promise ──────────────────
const fetchUser = (id) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (id > 0) resolve({ id, name: "Alice", email: "alice@ex.com" });
    else reject(new Error("Invalid user ID"));
  }, 1000);
});

// ── .then / .catch (older style) ──────────
fetchUser(1)
  .then(user => console.log("User:", user))
  .catch(err => console.error("Error:", err.message));

// ── async/await (modern — preferred) ──────
async function loadUser(id) {
  try {
    const user = await fetchUser(id);
    console.log(\`Loaded: \${user.name}\`);
    return user;
  } catch (error) {
    console.error(\`Failed: \${error.message}\`);
  }
}

loadUser(1);   // works
loadUser(-1);  // error caught

// ── Fetch API — real HTTP requests ─────────
async function getJoke() {
  try {
    const response = await fetch("https://api.chucknorris.io/jokes/random");
    const data = await response.json();
    console.log(data.value);
  } catch (error) {
    console.error("Network error:", error);
  }
}

// ── Promise.all — run in parallel ──────────
async function loadDashboard() {
  const [users, posts, comments] = await Promise.all([
    fetch("/api/users").then(r => r.json()),
    fetch("/api/posts").then(r => r.json()),
    fetch("/api/comments").then(r => r.json()),
  ]);
  console.log({ users, posts, comments });
}`,
      quiz: {
        question: 'What does Promise.all([p1, p2, p3]) do?',
        options: [
          'Runs p1, p2, p3 one after another (sequential)',
          'Returns whichever promise finishes first',
          'Runs all three simultaneously and waits for all to complete',
          'Returns an array of booleans indicating success/failure',
        ],
        answer: 2,
        explanation: 'Promise.all() runs all given promises SIMULTANEOUSLY (in parallel) and returns a new Promise that resolves when ALL of them have resolved — with an array of their results. If ANY promise rejects, Promise.all immediately rejects. This is much faster than running them sequentially with await one by one.',
      },
      challenge: {
        title: 'Async Data Fetcher with Retry',
        description: 'Write an async function fetchWithRetry(url, maxRetries=3) that: (1) Tries to fetch the URL, (2) If it fails, waits 1 second and retries, (3) After maxRetries failures, throws an error. Simulate success/failure with a function that randomly resolves or rejects. Also write a loadMultiple(urls) function that loads all URLs in parallel using Promise.all.',
        hint: 'Use a for loop with await inside. On error, await a sleep(1000) promise before retrying.',
        example: `const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      if (i < maxRetries - 1) await sleep(1000);
      else throw new Error(\`Failed after \${maxRetries} attempts\`);
    }
  }
}`,
      },
    },
    {
      id: 'js-i-2',
      title: 'DOM Manipulation',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'What is the DOM?' },
        { time: '1:30', label: 'Selecting elements' },
        { time: '3:00', label: 'Changing content and styles' },
        { time: '4:30', label: 'Creating and removing elements' },
        { time: '6:00', label: 'Event listeners' },
        { time: '7:30', label: 'Event delegation' },
      ],
      theory: `The **DOM (Document Object Model)** is the browser's live representation of your HTML page as a tree of objects. JavaScript can read and modify this tree — adding elements, changing text, applying styles, responding to clicks — all without reloading the page.

This is what makes websites interactive. When you click a "Like" button and the count changes, when you type and a dropdown appears, when you scroll and a navbar changes colour — that's all DOM manipulation.

**Event delegation** is a powerful pattern where instead of attaching an event listener to every element, you attach ONE listener to a parent and let events "bubble up" from children.`,
      concepts: [
        { label: 'querySelector', desc: 'Selects the FIRST matching element using any CSS selector.' },
        { label: 'querySelectorAll', desc: 'Selects ALL matching elements as a NodeList.' },
        { label: 'addEventListener', desc: 'Attaches a function to run when an event occurs on an element.' },
        { label: 'Event delegation', desc: 'One listener on parent handles events from all children via e.target.' },
      ],
      code: `// ── Selecting Elements ────────────────────
const title = document.querySelector("h1");
const btn   = document.querySelector("#myBtn");
const cards = document.querySelectorAll(".card");

// ── Reading & Changing Content ────────────
console.log(title.textContent);      // get text
title.textContent = "New Title!";    // set text
title.innerHTML = "Title with <b>bold</b>";

// ── Changing Styles ───────────────────────
title.style.color = "#818cf8";
title.style.fontSize = "2rem";

// Add/remove CSS classes (preferred approach)
title.classList.add("active");
title.classList.remove("hidden");
title.classList.toggle("dark");      // flip on/off

// ── Creating Elements ─────────────────────
const newCard = document.createElement("div");
newCard.className = "card";
newCard.textContent = "I was created by JS!";
document.body.appendChild(newCard);

// ── Removing Elements ─────────────────────
newCard.remove();
// OR: newCard.parentNode.removeChild(newCard);

// ── Event Listeners ───────────────────────
btn.addEventListener("click", (event) => {
  console.log("Button clicked!", event.target);
  btn.textContent = "Clicked!";
});

// Keyboard events
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") console.log("Escape pressed");
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    console.log("Ctrl+S intercepted!");
  }
});

// ── Event Delegation ──────────────────────
document.querySelector("#list").addEventListener("click", (e) => {
  if (e.target.matches("li")) {
    e.target.classList.toggle("selected");
    console.log("Selected:", e.target.textContent);
  }
});`,
      quiz: {
        question: 'What is the difference between textContent and innerHTML?',
        options: [
          'They are identical — no difference',
          'textContent sets plain text only; innerHTML parses HTML tags',
          'innerHTML is safer against XSS attacks',
          'textContent can only read text, not set it',
        ],
        answer: 1,
        explanation: 'textContent sets or gets raw text — any HTML tags are treated as literal characters and displayed as-is (safe). innerHTML parses the string as HTML, so <b>bold</b> actually renders bold text. However, innerHTML with user-supplied content is dangerous (XSS risk) — always sanitise user input!',
      },
      challenge: {
        title: 'Interactive Todo List',
        description: 'Build a todo list in HTML + JS. Create an HTML file with: an input field, an "Add" button, and an empty <ul> list. When the user types a task and clicks Add: (1) Create a new <li> with the task text, (2) Add a "Delete" button inside the <li>, (3) When Delete is clicked, remove that <li>. Use event delegation on the <ul> for delete clicks. Bonus: pressing Enter should also add the task.',
        hint: 'Create li element, set textContent, create button, append button to li, append li to ul.',
        example: `document.querySelector("#addBtn").addEventListener("click", addTask);
document.querySelector("#input").addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

function addTask() {
  const text = document.querySelector("#input").value.trim();
  if (!text) return;
  const li = document.createElement("li");
  li.textContent = text;
  const del = document.createElement("button");
  del.textContent = "✕";
  del.onclick = () => li.remove();
  li.appendChild(del);
  document.querySelector("#list").appendChild(li);
  document.querySelector("#input").value = "";
}`,
      },
    },
  ],
  expert: [
    {
      id: 'js-e-1',
      title: 'Design Patterns & Architecture',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Why design patterns matter' },
        { time: '1:30', label: 'Module pattern & ES Modules' },
        { time: '3:30', label: 'Observer / Pub-Sub pattern' },
        { time: '5:30', label: 'Factory and Singleton patterns' },
        { time: '7:30', label: 'MVC architecture overview' },
      ],
      theory: `**Design patterns** are reusable solutions to commonly occurring problems in software design. They're not code you copy-paste — they're concepts and templates that help structure your code in proven, maintainable ways.

Learning patterns is what separates junior developers from seniors. Instead of reinventing the wheel each time you face a problem, you can reach for a battle-tested pattern that the industry has refined over decades.

The patterns we cover here are the most relevant for modern JavaScript: module encapsulation, reactive updates (Observer), object creation (Factory/Singleton), and application structure (MVC).`,
      concepts: [
        { label: 'Module Pattern', desc: 'Encapsulate private state and expose only a public API.' },
        { label: 'Observer Pattern', desc: 'Subscribe to events; notify all listeners when state changes.' },
        { label: 'Factory Pattern', desc: 'Function that creates and returns objects without using new.' },
        { label: 'Singleton', desc: 'Ensure only ONE instance of a class/module exists in the app.' },
      ],
      code: `// ── Module Pattern ───────────────────────
const UserModule = (() => {
  // Private state — not accessible from outside
  let users = [];
  let nextId = 1;

  // Private function
  const validate = (user) => user.name && user.email;

  // Public API
  return {
    add(user) {
      if (!validate(user)) throw new Error("Invalid user");
      users.push({ id: nextId++, ...user });
    },
    getAll()  { return [...users]; },  // return copy!
    count()   { return users.length; },
    find(id)  { return users.find(u => u.id === id); },
  };
})();

UserModule.add({ name: "Alice", email: "a@ex.com" });
console.log(UserModule.getAll());
// console.log(users);  // ReferenceError! Private.

// ── Observer / EventEmitter ───────────────
class EventEmitter {
  #events = {};

  on(event, listener) {
    this.#events[event] ??= [];
    this.#events[event].push(listener);
    return () => this.off(event, listener); // unsubscribe fn
  }
  off(event, listener) {
    this.#events[event] = this.#events[event]?.filter(l => l !== listener);
  }
  emit(event, data) {
    this.#events[event]?.forEach(fn => fn(data));
  }
}

const store = new EventEmitter();
const unsub = store.on("update", data => console.log("Updated:", data));
store.emit("update", { user: "Alice" }); // Updated: {user: "Alice"}
unsub();  // unsubscribe
store.emit("update", { user: "Bob" });   // nothing — unsubscribed

// ── Factory Pattern ───────────────────────
const createButton = ({ label, color = "#6366f1", onClick }) => {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.style.background = color;
  btn.addEventListener("click", onClick);
  return btn;
};

// ── Singleton ─────────────────────────────
const Config = (() => {
  let instance = null;
  return {
    getInstance() {
      if (!instance) instance = { theme: "dark", lang: "en", version: "1.0.0" };
      return instance;
    }
  };
})();

const c1 = Config.getInstance();
const c2 = Config.getInstance();
console.log(c1 === c2);  // true — same object!`,
      quiz: {
        question: 'What problem does the Observer pattern solve?',
        options: [
          'Ensures only one instance of an object exists',
          'Decouples producers from consumers — listeners are notified of changes without tight coupling',
          'Creates objects without specifying their exact class',
          'Restricts access to private variables',
        ],
        answer: 1,
        explanation: 'The Observer pattern (also called Pub/Sub) decouples the "publisher" (thing that changes) from its "subscribers" (things that care about changes). The publisher doesn\'t know who\'s listening — it just emits events. Listeners subscribe without knowing the publisher\'s internals. This is the foundation of React\'s state management and Node.js event system.',
      },
      challenge: {
        title: 'Build a Mini State Manager',
        description: 'Build a simple state management store inspired by Redux: (1) createStore(reducer, initialState) — takes a reducer function and initial state, (2) getState() — returns current state, (3) dispatch(action) — calls reducer with current state + action, updates state, (4) subscribe(listener) — calls listener whenever state changes. Test it with a counter: actions INCREMENT and DECREMENT.',
        hint: 'Store state in a closure. After dispatch, call all subscribers. subscribe returns an unsubscribe function.',
        example: `function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];
  return {
    getState: () => state,
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach(fn => fn(state));
    },
    subscribe(fn) {
      listeners.push(fn);
      return () => listeners.splice(listeners.indexOf(fn), 1);
    }
  };
}
const store = createStore((s, a) => a.type === "INC" ? s+1 : s-1, 0);
store.subscribe(s => console.log("State:", s));
store.dispatch({type:"INC"});`,
      },
    },
  ],
};

// ─── HTML & CSS ───────────────────────────────
const htmlcssLessons = {
  beginner: [
    {
      id: 'html-b-1',
      title: 'HTML — The Structure of the Web',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'What is HTML?' },
        { time: '1:15', label: 'HTML document structure' },
        { time: '2:30', label: 'Tags, elements, and attributes' },
        { time: '4:00', label: 'Headings, paragraphs, links, images' },
        { time: '5:30', label: 'Lists — ordered and unordered' },
        { time: '7:00', label: 'Semantic HTML — why it matters' },
      ],
      theory: `**HTML (HyperText Markup Language)** is the standard language for creating web pages. It describes the **structure** of web content using a system of tags that wrap different pieces of content — telling the browser "this is a heading", "this is a paragraph", "this is an image".

HTML is not a programming language — it has no logic, loops, or variables. It's a **markup language**: you annotate (mark up) content to define its meaning and structure.

**Semantic HTML** means using the right tag for the right purpose — \`<nav>\` for navigation, \`<article>\` for articles, \`<button>\` for buttons. This improves accessibility, SEO, and maintainability.`,
      concepts: [
        { label: 'Element', desc: 'Opening tag + content + closing tag: <p>Hello</p>.' },
        { label: 'Attribute', desc: 'Extra info in the opening tag: <a href="url">. Format: name="value".' },
        { label: 'Self-closing', desc: 'Some tags have no content and close themselves: <img />, <br />, <input />.' },
        { label: 'Semantic HTML', desc: 'Use meaningful tags: <header>, <nav>, <main>, <article>, <footer>.' },
      ],
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My First Web Page</title>
  </head>

  <body>
    <!-- Semantic structure -->
    <header>
      <nav>
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>

    <main>
      <!-- Headings h1–h6 -->
      <h1>Welcome to My Portfolio</h1>
      <h2>About Me</h2>
      <p>
        I'm a <strong>web developer</strong> who loves building
        <em>beautiful</em> and <mark>functional</mark> websites.
      </p>

      <!-- Link & Image -->
      <a href="https://github.com" target="_blank">My GitHub</a>
      <img src="avatar.png" alt="My profile photo" width="200" />

      <!-- Lists -->
      <h3>My Skills</h3>
      <ul>
        <li>HTML & CSS</li>
        <li>JavaScript</li>
        <li>Python</li>
      </ul>

      <h3>My Top 3 Languages</h3>
      <ol>
        <li>JavaScript</li>
        <li>Python</li>
        <li>TypeScript</li>
      </ol>
    </main>

    <footer>
      <p>&copy; 2025 My Portfolio</p>
    </footer>
  </body>
</html>`,
      quiz: {
        question: 'Which attribute makes a link open in a new browser tab?',
        options: ['new="tab"', 'open="new"', 'target="_blank"', 'href="new-tab"'],
        answer: 2,
        explanation: 'The target="_blank" attribute on an <a> tag tells the browser to open the link in a new tab/window. Pro tip: always add rel="noopener noreferrer" alongside it for security — it prevents the new page from accessing your window object.',
      },
      challenge: {
        title: 'Build Your HTML CV',
        description: 'Create a complete HTML page for your CV/resume. Include: (1) A <header> with your name as h1 and a tagline as h2, (2) A <section> for About Me with a paragraph, (3) A <section> for Skills with an unordered list of at least 5 skills, (4) A <section> for Education with an ordered list, (5) A <footer> with your email as a mailto: link. Use semantic tags throughout.',
        hint: 'mailto: links look like: <a href="mailto:you@example.com">Email me</a>',
        example: `<!DOCTYPE html>
<html lang="en">
<head><title>My CV</title></head>
<body>
  <header>
    <h1>Alice Johnson</h1>
    <h2>Frontend Developer</h2>
  </header>
  <main>
    <section id="about"><h3>About</h3><p>...</p></section>
    <section id="skills">
      <h3>Skills</h3>
      <ul><li>HTML</li><li>CSS</li><li>JS</li></ul>
    </section>
  </main>
  <footer><a href="mailto:alice@ex.com">alice@ex.com</a></footer>
</body>
</html>`,
      },
    },
    {
      id: 'html-b-2',
      title: 'CSS — Styling the Web',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'What is CSS and how it connects to HTML' },
        { time: '1:30', label: 'Selectors — element, class, ID' },
        { time: '3:00', label: 'Colors, fonts, and text properties' },
        { time: '4:30', label: 'The Box Model — margin, border, padding' },
        { time: '6:00', label: 'CSS specificity and the cascade' },
        { time: '7:30', label: 'CSS custom properties (variables)' },
      ],
      theory: `**CSS (Cascading Style Sheets)** is the language that styles HTML. While HTML provides structure, CSS controls the visual presentation — colours, fonts, spacing, layout, animations, and responsive behaviour.

The word "cascading" refers to how CSS resolves conflicts when multiple rules target the same element. Rules are applied based on **specificity** (how specific the selector is) and **order** (later rules override earlier ones with equal specificity).

**CSS custom properties** (variables) are one of the most powerful modern CSS features — define a colour or value once, use it everywhere, change it in one place.`,
      concepts: [
        { label: 'Selector', desc: 'Targets which HTML elements the rules apply to. element, .class, #id.' },
        { label: 'Box Model', desc: 'Every element is a box: content → padding → border → margin.' },
        { label: 'Specificity', desc: 'ID > class > element. More specific selector wins conflicts.' },
        { label: 'CSS Variables', desc: '--color-primary: #6366f1; then use: color: var(--color-primary);' },
      ],
      code: `/* ── Selectors ──────────────────────────── */
h1           { color: #1e293b; }       /* element */
.card        { background: white; }    /* class */
#hero        { min-height: 100vh; }    /* ID */
h2.subtitle  { font-size: 1.5rem; }   /* element with class */
nav > a      { color: blue; }          /* direct child */
input:focus  { outline: 2px solid blue; } /* pseudo-class */

/* ── Typography ─────────────────────────── */
body {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #334155;
}
h1 {
  font-size: clamp(2rem, 5vw, 4rem);  /* responsive size! */
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* ── Colors ─────────────────────────────── */
.box {
  color: #334155;                       /* hex */
  background: rgb(99, 102, 241);        /* rgb */
  border-color: hsl(239, 84%, 67%);    /* hsl */
  box-shadow: 0 4px 24px rgba(0,0,0,0.1); /* rgba */
}

/* ── Box Model ───────────────────────────── */
.card {
  width: 320px;
  padding: 24px;          /* inner space */
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin: 16px auto;      /* outer space + center */
  box-sizing: border-box; /* include padding in width */
}

/* ── CSS Variables ───────────────────────── */
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --bg: #f8fafc;
  --text: #1e293b;
  --radius: 12px;
}

.button {
  background: var(--primary);
  border-radius: var(--radius);
  transition: background 0.2s;
}
.button:hover {
  background: var(--primary-dark);
}`,
      quiz: {
        question: 'Given: div {color: blue} and .title {color: red}, if a div has class="title", what color is the text?',
        options: ['Blue — element selector wins', 'Red — class selector wins (higher specificity)', 'Purple — they mix', 'Neither — a conflict error occurs'],
        answer: 1,
        explanation: 'CSS specificity: ID > class/attribute/pseudo-class > element. A class selector (.title) has higher specificity than an element selector (div). So red wins. Specificity values: element=0,0,1; class=0,1,0; ID=1,0,0. When values are equal, the later rule in the stylesheet wins.',
      },
      challenge: {
        title: 'Style a Profile Card',
        description: 'Create an HTML file with a profile card containing: avatar (use a coloured circle with CSS), name, role, a short bio, and 3 skill tags. Style it with CSS: dark background, a card with rounded corners and shadow, proper typography hierarchy, hover effect on the skill tags, and CSS variables for your colour palette. No frameworks — pure CSS only!',
        hint: 'Use border-radius: 50% for a circle avatar. Use :hover pseudo-class for tag hover effect.',
        example: `/* style.css */
:root { --primary: #6366f1; --bg: #0f172a; }
body { background: var(--bg); display: grid; place-items: center; min-height: 100vh; }
.card { background: #1e293b; border-radius: 16px; padding: 32px; max-width: 320px; }
.avatar { width: 80px; height: 80px; background: var(--primary); border-radius: 50%; }
.tag { background: rgba(99,102,241,0.2); padding: 4px 12px; border-radius: 20px; }
.tag:hover { background: var(--primary); color: white; }`,
      },
    },
    {
      id: 'html-b-3',
      title: 'Flexbox Layout',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'The layout problem CSS solves' },
        { time: '1:00', label: 'display: flex — the container' },
        { time: '2:15', label: 'justify-content — main axis' },
        { time: '3:30', label: 'align-items — cross axis' },
        { time: '4:45', label: 'flex-wrap and gap' },
        { time: '6:00', label: 'flex on items — grow, shrink, basis' },
        { time: '7:15', label: 'Common Flexbox patterns' },
      ],
      theory: `**Flexbox** (Flexible Box Layout) is a CSS layout system designed to distribute space and align items in one dimension — either a row or a column.

Before Flexbox, centering elements vertically in CSS was notoriously painful. Flexbox solved this elegantly with a few properties. Today it's the standard for component-level layouts — navbars, cards, form rows, toolbars, and more.

Flexbox works on two levels: the **container** (the parent with display:flex) and the **items** (direct children). Container properties control the overall layout; item properties control individual item behaviour.`,
      concepts: [
        { label: 'flex-direction', desc: 'row (default, →) or column (↓). Sets the main axis.' },
        { label: 'justify-content', desc: 'Aligns items along the MAIN axis: flex-start, center, space-between, space-around.' },
        { label: 'align-items', desc: 'Aligns items along the CROSS axis: flex-start, center, stretch, flex-end.' },
        { label: 'flex: 1', desc: 'Item grows to fill available space. flex is shorthand for grow shrink basis.' },
      ],
      code: `/* ── Basic Flexbox Container ─────────────── */
.container {
  display: flex;
  flex-direction: row;          /* row | column | row-reverse */
  justify-content: space-between; /* main axis alignment */
  align-items: center;          /* cross axis alignment */
  flex-wrap: wrap;              /* allow items to wrap */
  gap: 16px;                    /* space between items */
}

/* ── Centering — the Holy Grail ──────────── */
.center-everything {
  display: flex;
  justify-content: center;  /* horizontal center */
  align-items: center;      /* vertical center */
  min-height: 100vh;        /* full viewport height */
}

/* ── Navigation Bar ───────────────────────── */
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background: #0f172a;
}
nav .logo  { font-weight: 700; }
nav .links { display: flex; gap: 24px; }
nav .cta   { margin-left: auto; }

/* ── Card Grid (flex version) ────────────── */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.card {
  flex: 1 1 280px;   /* grow:1 shrink:1 basis:280px */
  min-width: 0;      /* prevent overflow */
}

/* ── Flex Items ───────────────────────────── */
.sidebar { flex: 0 0 260px; }  /* fixed width, no grow */
.main    { flex: 1; }          /* grow to fill rest */
.item    { align-self: flex-start; } /* override align-items */`,
      quiz: {
        question: 'Which property centres flex items along the MAIN axis?',
        options: ['align-items', 'align-content', 'justify-items', 'justify-content'],
        answer: 3,
        explanation: 'justify-content controls alignment along the MAIN axis (horizontal in row, vertical in column). align-items controls the CROSS axis (perpendicular). A common mnemonic: "Justify = main axis (think: justified text = horizontal), Align = cross axis".',
      },
      challenge: {
        title: 'Responsive Pricing Page',
        description: 'Build a pricing page with 3 plans (Free, Pro, Enterprise) using Flexbox. Each card should have: plan name, price, a list of features, and a CTA button. The cards should be: side by side on wide screens (flex-direction: row), stacked vertically on narrow screens (use flex-wrap + min-width). The middle "Pro" card should be slightly larger and highlighted. Centre everything on the page.',
        hint: 'Use flex-wrap:wrap and flex: 1 1 280px on cards. Transform the Pro card with transform: scale(1.05).',
        example: `.plans { display:flex; justify-content:center; gap:20px; flex-wrap:wrap; padding:40px; }
.plan { flex: 1 1 260px; max-width:320px; border:1px solid #e2e8f0; border-radius:16px; padding:32px; }
.plan.featured { border-color:#6366f1; transform:scale(1.05); background:#f5f3ff; }`,
      },
    },
  ],
  intermediate: [
    {
      id: 'html-i-1',
      title: 'CSS Grid & Responsive Design',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Grid vs Flexbox — when to use which' },
        { time: '1:30', label: 'CSS Grid basics — rows and columns' },
        { time: '3:00', label: 'grid-template-areas' },
        { time: '4:30', label: 'Media queries and breakpoints' },
        { time: '6:00', label: 'Mobile-first approach' },
        { time: '7:30', label: 'Responsive typography with clamp()' },
      ],
      theory: `**CSS Grid** is a two-dimensional layout system — unlike Flexbox which handles one axis at a time, Grid handles both rows AND columns simultaneously. Use Grid for page-level layouts; Flexbox for component-level layouts.

**Responsive design** ensures your website looks great on all screen sizes — from small phones to large desktop monitors. This is achieved with **media queries** that apply different CSS rules at different screen widths.

**Mobile-first** means writing CSS for mobile screens first, then adding media queries to enhance the layout for larger screens. This approach leads to cleaner, more performant CSS.`,
      concepts: [
        { label: 'grid-template-columns', desc: 'Defines column sizes: repeat(3,1fr) = 3 equal columns.' },
        { label: 'fr unit', desc: 'Fraction of available space. 1fr 2fr = 1/3 and 2/3 of space.' },
        { label: 'grid-template-areas', desc: 'Name areas and visually map your layout with ASCII art.' },
        { label: 'Media queries', desc: '@media (min-width: 768px) { } — apply styles at this breakpoint.' },
      ],
      code: `/* ── CSS Grid Basics ─────────────────────── */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 equal columns */
  grid-template-rows: auto;
  gap: 20px;
}

/* Auto-fit — responsive without media queries! */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* ── Named Grid Areas ─────────────────────── */
.page-layout {
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header  header"
    "sidebar main    aside"
    "footer  footer  footer";
  min-height: 100vh;
  gap: 0;
}
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }

/* ── Responsive Design (Mobile-First) ──────── */
/* Base: mobile */
.container { width: 100%; padding: 16px; }
.grid { grid-template-columns: 1fr; }
.page-layout {
  grid-template-columns: 1fr;
  grid-template-areas: "header" "main" "footer";
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .container { max-width: 768px; margin: 0 auto; padding: 24px; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .container { max-width: 1200px; }
  .grid { grid-template-columns: repeat(3, 1fr); }
  .page-layout {
    grid-template-columns: 240px 1fr 300px;
    grid-template-areas: "header header header" "sidebar main aside" "footer footer footer";
  }
}

/* Responsive typography */
h1 { font-size: clamp(1.5rem, 4vw + 1rem, 4rem); }`,
      quiz: {
        question: 'What does grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) do?',
        options: [
          'Creates exactly 280 columns',
          'Creates columns that are always exactly 280px',
          'Creates as many columns as fit, each at least 280px, growing equally',
          'Creates one column of 280px and fills the rest with 1fr',
        ],
        answer: 2,
        explanation: 'auto-fit tells Grid to create as many columns as possible. minmax(280px, 1fr) means each column is at least 280px but grows to fill space equally. As the screen gets narrower, columns automatically drop to new rows. This gives you responsive grids WITHOUT media queries — one of CSS Grid\'s superpowers!',
      },
      challenge: {
        title: 'Full Page Responsive Layout',
        description: 'Build a complete page layout with CSS Grid that has: a header (full width, contains logo + nav), a sidebar (240px, has navigation links), a main content area (flexible, has a 3-column card grid inside using auto-fit), an aside (200px, optional widgets), and a footer (full width). It must be fully responsive: on mobile, everything stacks vertically and the sidebar becomes a top menu.',
        hint: 'Define grid-template-areas for desktop layout. In your base (mobile) CSS, set grid-template-areas to stack everything in one column.',
        example: `.layout { display:grid; grid-template-areas:"h h h" "s m a" "f f f"; grid-template-columns:240px 1fr 200px; min-height:100vh; }
@media(max-width:768px) {
  .layout { grid-template-columns:1fr; grid-template-areas:"h" "s" "m" "f"; }
  .aside { display:none; }
}`,
      },
    },
  ],
  expert: [
    {
      id: 'html-e-1',
      title: 'CSS Animations & Advanced Techniques',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'CSS transitions — smooth state changes' },
        { time: '2:00', label: '@keyframes animations' },
        { time: '4:00', label: 'Animation properties — timing, delay, fill' },
        { time: '5:30', label: 'CSS transforms — translate, scale, rotate' },
        { time: '7:00', label: 'Performance — what to animate' },
        { time: '8:30', label: 'Advanced: scroll-driven animations' },
      ],
      theory: `CSS animations bring your interfaces to life — but done wrong, they can destroy performance. Done right, they significantly enhance user experience by providing visual feedback, guiding attention, and communicating state changes.

**Transitions** smoothly animate between two CSS states (e.g., hover). **@keyframes animations** provide full control over multi-step animations with precise timing.

For performance: ONLY animate **transform** and **opacity** properties. These are GPU-accelerated and don't cause layout recalculation (reflow) or paint. Animating width, height, top, left, or color causes expensive reflows — avoid them!`,
      concepts: [
        { label: 'transition', desc: 'Smoothly animate between states: transition: all 0.3s ease.' },
        { label: '@keyframes', desc: 'Define animation steps from/to or with % waypoints.' },
        { label: 'transform', desc: 'translate, scale, rotate, skew — GPU-accelerated, no reflow.' },
        { label: 'will-change', desc: 'Hints browser to optimise an element before animation starts.' },
      ],
      code: `/* ── Transitions ─────────────────────────── */
.button {
  background: #6366f1;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s;
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99,102,241,0.5);
  background: #4f46e5;
}
.button:active {
  transform: translateY(0);
}

/* ── @keyframes ────────────────────────────── */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.1); opacity: 0.7; }
}

/* ── Applying Animations ─────────────────── */
.hero-title {
  animation: fadeSlideUp 0.6s ease forwards;
}
.hero-subtitle {
  animation: fadeSlideUp 0.6s ease 0.2s both; /* delay 200ms */
}
.loader {
  animation: spin 1s linear infinite;
}
.badge {
  animation: pulse 2s ease-in-out infinite;
}

/* ── Staggered children ─────────────────── */
.card { opacity: 0; animation: fadeSlideUp 0.5s ease forwards; }
.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }

/* ── Scroll-driven (modern) ─────────────── */
@supports (animation-timeline: scroll()) {
  .progress-bar {
    animation: grow linear;
    animation-timeline: scroll();
    transform-origin: left;
  }
  @keyframes grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
}`,
      quiz: {
        question: 'Why should you prefer animating transform and opacity over width and height?',
        options: [
          'transform and opacity have nicer default easing curves',
          'width/height animations are not supported in CSS',
          'transform and opacity are GPU-accelerated and avoid expensive layout recalculations',
          'Only transform and opacity work with @keyframes',
        ],
        answer: 2,
        explanation: 'Animating width/height triggers layout reflow — the browser recalculates positions of ALL elements on the page, then repaints. This is expensive and causes jank (stuttering). transform and opacity are handled entirely by the GPU compositor — they never trigger reflow or repaint, resulting in silky-smooth 60fps animations even on complex pages.',
      },
      challenge: {
        title: 'Animated Landing Page Hero',
        description: 'Build an animated landing page hero section with: (1) A gradient animated background that slowly shifts colours, (2) A headline that fades and slides up on load, (3) A subheading with a 200ms delay stagger, (4) A CTA button that lifts on hover with a glow shadow effect, (5) A floating badge or element that gently bobs up and down. Use ONLY transform and opacity for all animations.',
        hint: 'Use @keyframes with background-position for gradient animation (background-size:200% 200%). For float use translateY(-8px) in the 50% keyframe.',
        example: `@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.hero {
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
}
@keyframes float {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-10px); }
}`,
      },
    },
  ],
};

// ─── FULL STACK ───────────────────────────────
const fullstackLessons = {
  beginner: [
    {
      id: 'fs-b-1',
      title: 'How the Web Works',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Client, server, and the internet' },
        { time: '1:30', label: 'HTTP request/response cycle' },
        { time: '3:00', label: 'DNS — how URLs become IPs' },
        { time: '4:15', label: 'What browsers actually do' },
        { time: '5:30', label: 'Frontend vs Backend vs Full Stack' },
        { time: '7:00', label: 'Popular full-stack architectures' },
      ],
      theory: `Before writing full-stack applications, you must understand **how the web actually works**. Every time you visit a website, an intricate series of events happens in milliseconds.

A **client** (your browser) makes a request. A **server** (a computer somewhere in the world) receives that request, processes it, and sends back a response. This is the **HTTP request-response cycle** — the fundamental pattern of the web.

**Full Stack** means building BOTH the frontend (what users see) and the backend (the server, database, and business logic). Full stack developers have the rare ability to build complete, deployable products independently.`,
      concepts: [
        { label: 'HTTP', desc: 'HyperText Transfer Protocol — the rules for how clients and servers talk.' },
        { label: 'DNS', desc: 'Domain Name System — translates "google.com" into an IP address like 142.250.80.46.' },
        { label: 'REST API', desc: 'Architectural style for APIs — resources accessed via HTTP methods (GET/POST/etc).' },
        { label: 'Frontend/Backend', desc: 'Frontend = browser code (HTML/CSS/JS). Backend = server code + database.' },
      ],
      code: `// ── The HTTP Request-Response Cycle ──────
/*
  1. You type: https://www.github.com
  2. Browser checks DNS cache → queries DNS server
  3. DNS resolves "github.com" → IP: 140.82.114.4
  4. Browser opens TCP connection (3-way handshake)
  5. Browser sends HTTP GET request:
     GET / HTTP/1.1
     Host: github.com
     Accept: text/html
  6. GitHub's server receives request
  7. Server fetches data, renders HTML
  8. Server sends HTTP 200 response with HTML
  9. Browser parses HTML, fetches CSS/JS/images
  10. Browser renders the complete page
*/

// ── HTTP Status Codes ──────────────────────
const STATUS_CODES = {
  200: "OK — request succeeded",
  201: "Created — new resource made",
  301: "Moved Permanently — redirect",
  400: "Bad Request — invalid input",
  401: "Unauthorized — login required",
  403: "Forbidden — no permission",
  404: "Not Found — resource missing",
  429: "Too Many Requests — rate limited",
  500: "Internal Server Error — server crashed",
  503: "Service Unavailable — server overloaded",
};

// ── Full Stack Architecture ────────────────
/*
  ┌─────────────────────────────────────────┐
  │              FRONTEND                    │
  │  React / HTML / CSS / JavaScript         │
  │  Runs in the USER'S browser              │
  └──────────────┬──────────────────────────┘
                 │ HTTP/REST API calls
  ┌──────────────▼──────────────────────────┐
  │              BACKEND                     │
  │  Node.js + Express / Python + FastAPI    │
  │  Runs on a SERVER (cloud / VPS)          │
  └──────────────┬──────────────────────────┘
                 │ SQL / NoSQL queries
  ┌──────────────▼──────────────────────────┐
  │              DATABASE                    │
  │  PostgreSQL / MongoDB / Redis            │
  │  Stores all persistent data              │
  └─────────────────────────────────────────┘
*/

// ── Making API calls from Frontend ────────
async function fetchPosts() {
  const response = await fetch("https://api.example.com/posts");
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  const posts = await response.json();
  return posts;
}`,
      quiz: {
        question: 'What does a DNS server do?',
        options: [
          'Stores website files',
          'Translates domain names into IP addresses',
          'Encrypts network traffic',
          'Manages HTTP requests',
        ],
        answer: 1,
        explanation: 'DNS (Domain Name System) is like the internet\'s phone book. When you type "github.com", your browser first asks a DNS server "what\'s the IP address for github.com?" The DNS server responds with something like 140.82.114.4. Your browser then connects to that IP. Without DNS, you\'d have to memorise IP addresses for every website!',
      },
      challenge: {
        title: 'Map the Architecture',
        description: 'Design the architecture for a Twitter-like app. Write comments or a diagram (in plain text/ASCII) describing: (1) What the frontend handles (list 5 specific things), (2) What the backend API endpoints would be (at least 6, with HTTP methods), (3) What data the database stores (at least 3 tables/collections with their fields), (4) What happens step-by-step when a user posts a tweet.',
        hint: 'Think about: GET /api/tweets, POST /api/tweets, GET /api/users/:id, POST /api/auth/login, etc.',
        example: `/*
FRONTEND: React app
- Renders tweet feed
- Handles login form
- Shows user profile

BACKEND: Node.js + Express
GET  /api/tweets       - Get all tweets
POST /api/tweets       - Create new tweet
GET  /api/users/:id    - Get user profile
POST /api/auth/login   - Login user

DATABASE: PostgreSQL
users (id, name, email, password_hash, avatar)
tweets (id, user_id, content, created_at, likes)
follows (follower_id, following_id)
*/`,
      },
    },
    {
      id: 'fs-b-2',
      title: 'Node.js & Express — Building APIs',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'What is Node.js?' },
        { time: '1:30', label: 'Setting up Express' },
        { time: '3:00', label: 'Routes — GET, POST, PUT, DELETE' },
        { time: '4:30', label: 'Middleware — the request pipeline' },
        { time: '6:00', label: 'Request params, query, and body' },
        { time: '7:30', label: 'Error handling middleware' },
      ],
      theory: `**Node.js** allows you to run JavaScript on the server — the same language on both frontend and backend. It's built on Chrome's V8 engine and uses a non-blocking, event-driven model that makes it exceptionally efficient for I/O-heavy applications like APIs.

**Express.js** is a minimal, unopinionated web framework for Node.js. It provides a clean, simple way to define routes, handle requests, and use middleware — without imposing a rigid structure.

**Middleware** is one of Express's most powerful concepts. Every request passes through a pipeline of middleware functions — for logging, parsing JSON, checking authentication, handling errors — before reaching the route handler.`,
      concepts: [
        { label: 'Route', desc: 'app.get("/path", handler) — maps HTTP method + URL to a handler function.' },
        { label: 'Middleware', desc: 'Function(req, res, next) — processes request before the route handler.' },
        { label: 'req.params', desc: '/users/:id → req.params.id. Dynamic URL segments.' },
        { label: 'req.body', desc: 'Parsed request body (JSON). Need express.json() middleware first.' },
      ],
      code: `// ── Setup ─────────────────────────────────
// npm init -y
// npm install express

const express = require("express");
const app = express();

// ── Middleware ─────────────────────────────
app.use(express.json());               // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Custom logger middleware
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next();  // MUST call next() to continue pipeline!
});

// ── In-memory "database" ───────────────────
let users = [
  { id: 1, name: "Alice", email: "alice@ex.com", age: 25 },
  { id: 2, name: "Bob",   email: "bob@ex.com",   age: 30 },
];
let nextId = 3;

// ── Routes ────────────────────────────────
// GET all users
app.get("/api/users", (req, res) => {
  const { age } = req.query;  // /api/users?age=25
  const filtered = age ? users.filter(u => u.age === +age) : users;
  res.json({ success: true, data: filtered, count: filtered.length });
});

// GET one user
app.get("/api/users/:id", (req, res) => {
  const user = users.find(u => u.id === +req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ success: true, data: user });
});

// POST — create user
app.post("/api/users", (req, res) => {
  const { name, email, age } = req.body;
  if (!name || !email) return res.status(400).json({ error: "name and email required" });
  const newUser = { id: nextId++, name, email, age };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// PUT — update user
app.put("/api/users/:id", (req, res) => {
  const index = users.findIndex(u => u.id === +req.params.id);
  if (index === -1) return res.status(404).json({ error: "Not found" });
  users[index] = { ...users[index], ...req.body };
  res.json({ success: true, data: users[index] });
});

// DELETE user
app.delete("/api/users/:id", (req, res) => {
  users = users.filter(u => u.id !== +req.params.id);
  res.status(204).send();
});

// ── Error handling middleware ──────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));`,
      quiz: {
        question: 'In Express middleware, what happens if you forget to call next()?',
        options: [
          'The middleware runs twice',
          'An error is automatically thrown',
          'The request hangs forever — the response is never sent',
          'Express automatically calls the next middleware',
        ],
        answer: 2,
        explanation: 'Forgetting next() is one of the most common Express bugs. The request-response cycle gets stuck — the middleware runs but the request never reaches the next middleware or route handler. The client\'s request just hangs until it times out. Always call next() unless you\'re sending a response yourself (res.json(), res.send(), etc.).',
      },
      challenge: {
        title: 'Build a Notes API',
        description: 'Build a complete REST API for a notes app. Notes have: id, title, content, createdAt, updatedAt, and tags (array). Implement all 5 routes: GET /api/notes (with optional ?tag= query filter), GET /api/notes/:id, POST /api/notes (validate title required), PUT /api/notes/:id (update updatedAt automatically), DELETE /api/notes/:id. Add a logger middleware and a 404 catch-all route.',
        hint: 'Set createdAt and updatedAt to new Date().toISOString(). In PUT, always update updatedAt.',
        example: `const express = require("express");
const app = express();
app.use(express.json());

let notes = [];
let nextId = 1;

app.get("/api/notes", (req,res) => {
  const {tag} = req.query;
  const result = tag ? notes.filter(n => n.tags.includes(tag)) : notes;
  res.json({data: result});
});
app.post("/api/notes", (req,res) => {
  const {title,content,tags=[]} = req.body;
  if(!title) return res.status(400).json({error:"title required"});
  const note = {id:nextId++, title, content, tags, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()};
  notes.push(note);
  res.status(201).json({data:note});
});`,
      },
    },
  ],
  intermediate: [
    {
      id: 'fs-i-1',
      title: 'Databases — SQL & PostgreSQL',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'Why we need databases' },
        { time: '1:30', label: 'SQL basics — CREATE, INSERT, SELECT' },
        { time: '3:30', label: 'Filtering — WHERE, ORDER BY, LIMIT' },
        { time: '5:00', label: 'Joining tables — the power of relations' },
        { time: '6:30', label: 'Connecting PostgreSQL to Node.js' },
        { time: '8:00', label: 'Parameterised queries — prevent SQL injection' },
      ],
      theory: `**Databases** persist data beyond a single server run. Without a database, all your data disappears when the server restarts. A proper database like PostgreSQL provides: persistence, concurrent access, transactions (ACID), querying, and relationships between data.

**SQL (Structured Query Language)** is the standard language for relational databases. It's been around since 1974 and is still the most widely used database paradigm. Every serious full-stack developer must know SQL.

**SQL injection** is one of the most common and dangerous web vulnerabilities — attackers insert malicious SQL into your queries. Always use **parameterised queries** ($1, $2) to prevent this.`,
      concepts: [
        { label: 'PRIMARY KEY', desc: 'Unique identifier for each row. Usually auto-incrementing integer or UUID.' },
        { label: 'FOREIGN KEY', desc: 'Links rows across tables — enforces relational integrity.' },
        { label: 'JOIN', desc: 'Combines rows from multiple tables based on a matching column.' },
        { label: 'Parameterised query', desc: 'Pass values separately from SQL — prevents injection attacks.' },
      ],
      code: `-- ── Schema Design ────────────────────────
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  published  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CRUD Operations ───────────────────────
-- INSERT
INSERT INTO users (name, email, password_hash)
VALUES ('Alice', 'alice@ex.com', 'hashed_password');

-- SELECT all
SELECT * FROM users;

-- SELECT with filter
SELECT id, name, email FROM users
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 10;

-- UPDATE
UPDATE posts SET published = true WHERE id = 5;

-- DELETE
DELETE FROM users WHERE id = 3;

-- ── JOINs ─────────────────────────────────
-- Get all posts with their author names
SELECT p.id, p.title, u.name as author, p.created_at
FROM posts p
INNER JOIN users u ON p.user_id = u.id
WHERE p.published = true
ORDER BY p.created_at DESC;

-- ── Node.js with pg (node-postgres) ───────
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ⚠️ NEVER do this (SQL injection risk!):
// const query = \`SELECT * FROM users WHERE email = '\${email}'\`;

// ✅ Always use parameterised queries:
async function getUserByEmail(email) {
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE email = $1",
    [email]   // $1 gets safely replaced with email value
  );
  return result.rows[0];  // undefined if not found
}

async function createPost(userId, title, content) {
  const result = await pool.query(
    \`INSERT INTO posts (user_id, title, content)
     VALUES ($1, $2, $3)
     RETURNING *\`,
    [userId, title, content]
  );
  return result.rows[0];
}`,
      quiz: {
        question: 'Why must you use parameterised queries instead of string concatenation in SQL?',
        options: [
          'Parameterised queries run faster',
          'String concatenation doesn\'t work with numbers',
          'Parameterised queries prevent SQL injection attacks',
          'Parameterised queries are required by PostgreSQL',
        ],
        answer: 2,
        explanation: 'SQL injection is when an attacker passes malicious SQL in user input. If your query is `SELECT * FROM users WHERE email = \' + email + \'`, an attacker can input: \' OR 1=1 -- to return ALL users. Parameterised queries ($1, $2) send the SQL and values separately — the database treats the values as pure data, never as SQL commands.',
      },
      challenge: {
        title: 'Design and Query a Blog Database',
        description: 'Write SQL to: (1) Create 3 tables: users, posts, and comments (with appropriate foreign keys and constraints), (2) Insert sample data (3 users, 4 posts, 6 comments), (3) Write a query to get all posts with: author name, comment count, and ordered by most recent, (4) Write a query to get a user\'s complete profile: their info + all their posts + comment count per post. Use JOINs and GROUP BY.',
        hint: 'For counts, use COUNT(*) with GROUP BY. You\'ll need LEFT JOIN to include posts with no comments.',
        example: `-- Tables
CREATE TABLE comments (id SERIAL PRIMARY KEY, post_id INT REFERENCES posts(id), user_id INT REFERENCES users(id), content TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

-- Query with counts
SELECT p.title, u.name as author, COUNT(c.id) as comment_count
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id, u.name
ORDER BY p.created_at DESC;`,
      },
    },
  ],
  expert: [
    {
      id: 'fs-e-1',
      title: 'Authentication, Security & Deployment',
      xp: 40,
      timestamps: [
        { time: '0:00', label: 'JWT authentication flow' },
        { time: '2:00', label: 'Password hashing with bcrypt' },
        { time: '4:00', label: 'Refresh tokens and security' },
        { time: '5:30', label: 'Environment variables and secrets' },
        { time: '7:00', label: 'Deploying to production — Railway/Render' },
        { time: '9:00', label: 'CI/CD basics' },
      ],
      theory: `**Authentication** verifies who a user is. **Authorisation** controls what they can do. These are two of the most critical — and most commonly misimplemented — aspects of any web application.

**JWT (JSON Web Tokens)** are a stateless authentication mechanism. The server creates a signed token containing user data, sends it to the client, and the client includes it in subsequent requests. The server verifies the signature without needing to store session data.

**Never store plain-text passwords**. Always hash them with bcrypt — a slow, salted hashing algorithm designed specifically for passwords. Its slowness is intentional — it makes brute-force attacks impractical.`,
      concepts: [
        { label: 'JWT', desc: 'Signed token with header.payload.signature — stateless auth.' },
        { label: 'bcrypt', desc: 'Password hashing with salt. One-way — you can verify but not reverse.' },
        { label: 'Refresh token', desc: 'Long-lived token to get new access tokens without re-logging in.' },
        { label: '.env file', desc: 'Store secrets (DB passwords, API keys) in environment variables, not code.' },
      ],
      code: `// ── Password Hashing ──────────────────────
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 12; // higher = slower = more secure

async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);  // true or false
}

// ── JWT Authentication ─────────────────────
const jwt = require("jsonwebtoken");

function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }    // short-lived!
  );
  const refreshToken = jwt.sign(
    { userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }    // long-lived
  );
  return { accessToken, refreshToken };
}

// ── Auth Routes ───────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already used" });
    const hash = await hashPassword(password);
    const user = await createUser(name, email, hash);
    const tokens = generateTokens(user.id);
    res.status(201).json({ user: { id: user.id, name, email }, ...tokens });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const tokens = generateTokens(user.id);
  res.json({ user: { id: user.id, name: user.name, email }, ...tokens });
});

// ── Auth Middleware ────────────────────────
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Protected route
app.get("/api/me", requireAuth, async (req, res) => {
  const user = await getUserById(req.user.userId);
  res.json({ user });
});`,
      quiz: {
        question: 'Why is bcrypt preferred over SHA-256 for hashing passwords?',
        options: [
          'bcrypt produces longer hashes',
          'bcrypt is intentionally slow and includes salt, making brute-force attacks impractical',
          'SHA-256 is not secure enough for any purpose',
          'bcrypt is built into browsers, SHA-256 is not',
        ],
        answer: 1,
        explanation: 'SHA-256 is a fast general-purpose hash — it can compute billions of hashes per second on modern hardware, making brute-force feasible. bcrypt is deliberately slow (configurable via salt rounds) — at 12 rounds, it takes ~250ms per hash. An attacker who steals your database would need millions of years to crack bcrypt hashes. It also automatically adds a random salt, preventing rainbow table attacks.',
      },
      challenge: {
        title: 'Complete Auth System',
        description: 'Build a complete authentication system with: (1) POST /api/auth/register — validate input, hash password, create user, return tokens, (2) POST /api/auth/login — verify credentials, return tokens, (3) POST /api/auth/refresh — accept refresh token, return new access token, (4) GET /api/me — protected, return current user, (5) POST /api/auth/logout — invalidate refresh token (store in a blacklist array). Test every route and error case.',
        hint: 'Keep a refreshTokenBlacklist = new Set() in memory. In refresh route, check if token is blacklisted.',
        example: `const blacklist = new Set();
app.post("/api/auth/refresh", (req,res) => {
  const {refreshToken} = req.body;
  if (!refreshToken || blacklist.has(refreshToken))
    return res.status(401).json({error:"Invalid refresh token"});
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({userId:decoded.userId}, process.env.JWT_SECRET, {expiresIn:"15m"});
    res.json({accessToken});
  } catch {
    res.status(401).json({error:"Expired refresh token"});
  }
});`,
      },
    },
  ],
};

// ─── EXPORT ───────────────────────────────────
export const LESSONS = {
  python:     pythonLessons,
  javascript: javascriptLessons,
  htmlcss:    htmlcssLessons,
  fullstack:  fullstackLessons,
};

// Helper: total lessons in a language
export function getTotalLessons(langId) {
  const lang = LESSONS[langId];
  if (!lang) return 0;
  return Object.values(lang).reduce((sum, level) => sum + level.length, 0);
}

// Helper: XP per lesson
export function getXpPerLesson(langId) {
  return 40; // Fixed XP per lesson as requested
}
