
const HLJS_AVAILABLE = (typeof hljs !== 'undefined');

/* ────────────────────────────────────────────
   LANGUAGE CONFIG
──────────────────────────────────────────── */
const LANG_COLORS = {
  python:'#3572A5', javascript:'#f1e05a', typescript:'#3178c6', java:'#b07219',
  cpp:'#f34b7d', csharp:'#178600', go:'#00ADD8', rust:'#DEA584',
  kotlin:'#A97BFF', php:'#4F5D95', ruby:'#701516', bash:'#89e051',
};
const LANG_EXT = {
  python:'py', javascript:'js', typescript:'ts', java:'java',
  cpp:'cpp', csharp:'cs', go:'go', rust:'rs', kotlin:'kt', php:'php', ruby:'rb', bash:'sh',
};
const HLJS_LANG = {
  python:'python', javascript:'javascript', typescript:'typescript', java:'java',
  cpp:'cpp', csharp:'csharp', go:'go', rust:'rust', kotlin:'kotlin',
  php:'php', ruby:'ruby', bash:'bash',
};

/* ────────────────────────────────────────────
   SAMPLES
──────────────────────────────────────────── */
const SAMPLES = {
  python:`def fibonacci(n):
    """Return the nth Fibonacci number."""
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

def is_prime(num):
    """Check if a number is prime."""
    if num < 2:
        return False
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            return False
    return True

for i in range(10):
    fib = fibonacci(i)
    prime = "prime" if is_prime(fib) else "not prime"
    print(f"fibonacci({i}) = {fib} ({prime})")`,
  javascript:`function fibonacci(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

for (let i = 0; i < 10; i++) {
  const fib = fibonacci(i);
  console.log(\`fibonacci(\${i}) = \${fib} (\${isPrime(fib) ? 'prime' : 'not prime'})\`);
}`,
  java:`public class Main {
    public static int fibonacci(int n) {
        if (n <= 0) return 0;
        if (n == 1) return 1;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int temp = b; b = a + b; a = temp;
        }
        return b;
    }
    public static boolean isPrime(int num) {
        if (num < 2) return false;
        for (int i = 2; i <= Math.sqrt(num); i++) {
            if (num % i == 0) return false;
        }
        return true;
    }
    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            int fib = fibonacci(i);
            System.out.printf("fibonacci(%d) = %d (%s)%n", i, fib, isPrime(fib) ? "prime" : "not prime");
        }
    }
}`,
  go:`package main

import (
    "fmt"
    "math"
)

func fibonacci(n int) int {
    if n <= 0 {
        return 0
    }
    if n == 1 {
        return 1
    }
    a, b := 0, 1
    for i := 2; i <= n; i++ {
        a, b = b, a+b
    }
    return b
}

func isPrime(num int) bool {
    if num < 2 {
        return false
    }
    for i := 2; i <= int(math.Sqrt(float64(num))); i++ {
        if num%i == 0 {
            return false
        }
    }
    return true
}

func main() {
    for i := 0; i < 10; i++ {
        fib := fibonacci(i)
        label := "not prime"
        if isPrime(fib) {
            label = "prime"
        }
        fmt.Printf("fibonacci(%d) = %d (%s)\\n", i, fib, label)
    }
}`,
};

/* ────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────── */
function reindent(code, spaces) {
  const pad = ' '.repeat(spaces);
  return code.split('\n').map(l => pad + l).join('\n');
}
function toCamel(s) { return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); }
function toSnake(s) { return s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''); }
function capitalize(s) {
  const special = { javascript:'JavaScript', typescript:'TypeScript', csharp:'C#', cpp:'C++' };
  return special[s] || s.charAt(0).toUpperCase() + s.slice(1);
}

/* ────────────────────────────────────────────
   CONVERTERS
──────────────────────────────────────────── */
function pythonToJavaScript(code) {
  const notes = [];
  let out = code;
  out = out.replace(/def (\w+)\((.*?)\)\s*->\s*[\w\[\], ]+\s*:/g, (_, name, params) => {
    const cleanParams = params.replace(/:\s*[\w\[\], \.]+/g, '').replace(/=\s*None/g, '= null');
    return `function ${toCamel(name)}(${cleanParams}) {`;
  });
  out = out.replace(/def (\w+)\((.*?)\)\s*:/g, (_, name, params) => {
    const cleanParams = params.replace(/:\s*[\w\[\], \.]+/g, '').replace(/=\s*None/g, '= null');
    return `function ${toCamel(name)}(${cleanParams}) {`;
  });
  out = out.replace(/"""([\s\S]*?)"""/g, (_, s) => `/* ${s.trim()} */`);
  out = out.replace(/'''([\s\S]*?)'''/g, (_, s) => `/* ${s.trim()} */`);
  out = out.replace(/class (\w+)(?:\((\w+)\))?:/g, (_, name, parent) =>
    parent ? `class ${name} extends ${parent} {` : `class ${name} {`);
  out = out.replace(/f"(.*?)"/g, (_, s) => '`' + s.replace(/\{(\w+)\}/g, '${$1}') + '`');
  out = out.replace(/f'(.*?)'/g, (_, s) => '`' + s.replace(/\{(\w+)\}/g, '${$1}') + '`');
  out = out.replace(/print\((.*?)\)/g, 'console.log($1)');
  out = out.replace(/\belif\b/g, 'else if');
  out = out.replace(/\bTrue\b/g, 'true');
  out = out.replace(/\bFalse\b/g, 'false');
  out = out.replace(/\bNone\b/g, 'null');
  out = out.replace(/len\((\w+)\)/g, '$1.length');
  out = out.replace(/\bnot\s+(\w+)/g, '!$1');
  out = out.replace(/\band\b/g, '&&');
  out = out.replace(/\bor\b/g, '||');
  out = out.replace(/\.upper\(\)/g, '.toUpperCase()');
  out = out.replace(/\.lower\(\)/g, '.toLowerCase()');
  out = out.replace(/\.strip\(\)/g, '.trim()');
  out = out.replace(/isinstance\((\w+),\s*(\w+)\)/g, '$1 instanceof $2');
  out = out.replace(/for (\w+) in range\((\d+)\):/g, 'for (let $1 = 0; $1 < $2; $1++) {');
  out = out.replace(/for (\w+) in range\((\w+),\s*(\w+)\):/g, 'for (let $1 = $2; $1 < $3; $1++) {');
  out = out.replace(/for (\w+) in (\w+):/g, 'for (const $1 of $2) {');
  out = out.replace(/while (.+?):/g, 'while ($1) {');
  out = out.replace(/if (.+?):/g, 'if ($1) {');
  out = out.replace(/else:/g, '} else {');
  out = convertIndentToBraces(out);
  out = out.replace(/^(\s*)([a-z_]\w*)\s*=\s*(.+)$/gm, (match, indent, name, val) => {
    if (/^(if|else|while|for|function|class|return|const|let|var|\/\/|\/\*)/.test(match.trim())) return match;
    return `${indent}let ${name} = ${val}`;
  });
  notes.push('• Function definitions converted: <code>def</code> → <code>function</code>');
  notes.push('• <code>print()</code> → <code>console.log()</code>');
  notes.push('• F-strings converted to template literals (<code>`${...}`</code>)');
  notes.push('• <code>True/False/None</code> → <code>true/false/null</code>');
  notes.push('• <code>range()</code> for-loops converted to C-style loops');
  notes.push('• <strong>Manual review needed:</strong> list comprehensions, decorators, multiple return values, and complex type hints require manual conversion');
  return { code: out, notes };
}

function javascriptToPython(code) {
  const notes = [];
  let out = code;
  out = out.replace(/const (\w+)\s*=\s*\((.*?)\)\s*=>\s*\{/g, 'def $1($2):');
  out = out.replace(/const (\w+)\s*=\s*\((.*?)\)\s*=>/g, 'def $1($2): return ');
  out = out.replace(/const (\w+)\s*=\s*(\w+)\s*=>\s*\{/g, 'def $1($2):');
  out = out.replace(/function (\w+)\s*\((.*?)\)\s*\{/g, 'def $1($2):');
  out = out.replace(/`([\s\S]*?)`/g, (_, s) => 'f"' + s.replace(/\$\{(\w+)\}/g, '{$1}') + '"');
  out = out.replace(/console\.log\((.*?)\)/g, 'print($1)');
  out = out.replace(/console\.(warn|error|info)\((.*?)\)/g, 'print($2)');
  out = out.replace(/\btrue\b/g, 'True');
  out = out.replace(/\bfalse\b/g, 'False');
  out = out.replace(/\bnull\b/g, 'None');
  out = out.replace(/\bundefined\b/g, 'None');
  out = out.replace(/===/g, '==');
  out = out.replace(/!==/g, '!=');
  out = out.replace(/&&/g, 'and');
  out = out.replace(/\|\|/g, 'or');
  out = out.replace(/\.toUpperCase\(\)/g, '.upper()');
  out = out.replace(/\.toLowerCase\(\)/g, '.lower()');
  out = out.replace(/\.trim\(\)/g, '.strip()');
  out = out.replace(/\.length/g, '.__len__()');
  out = out.replace(/typeof (\w+) === 'string'/g, 'isinstance($1, str)');
  out = out.replace(/typeof (\w+) === 'number'/g, 'isinstance($1, (int, float))');
  out = out.replace(/typeof (\w+) === 'boolean'/g, 'isinstance($1, bool)');
  out = out.replace(/(\w+) instanceof (\w+)/g, 'isinstance($1, $2)');
  out = out.replace(/Math\.sqrt\(/g, 'math.sqrt(');
  out = out.replace(/Math\.abs\(/g, 'abs(');
  out = out.replace(/Math\.floor\(/g, 'math.floor(');
  out = out.replace(/Math\.ceil\(/g, 'math.ceil(');
  out = out.replace(/Math\.round\(/g, 'round(');
  out = out.replace(/Math\.max\(/g, 'max(');
  out = out.replace(/Math\.min\(/g, 'min(');
  out = out.replace(/Math\.pow\((\w+),\s*(\w+)\)/g, '$1 ** $2');
  out = out.replace(/for\s*\((?:const|let|var)\s+(\w+)\s+of\s+(\w+)\)\s*\{/g, 'for $1 in $2:');
  out = out.replace(/for\s*\((?:let|var)\s+(\w+)\s*=\s*0;\s*\1\s*<\s*(\w+);\s*\1\+\+\)\s*\{/g, 'for $1 in range($2):');
  out = out.replace(/for\s*\((?:let|var)\s+(\w+)\s*=\s*(\w+);\s*\1\s*<\s*(\w+);\s*\1\+\+\)\s*\{/g, 'for $1 in range($2, $3):');
  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while $1:');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if $1:');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, 'elif $1:');
  out = out.replace(/\}\s*else\s*\{/g, 'else:');
  out = out.replace(/class (\w+) extends (\w+)\s*\{/g, 'class $1($2):');
  out = out.replace(/class (\w+)\s*\{/g, 'class $1:');
  out = out.replace(/\b(const|let|var)\s+/g, '');
  out = out.replace(/;$/gm, '');
  out = convertBracesToIndent(out);
  notes.push('• <code>function</code> → <code>def</code>, template literals → f-strings');
  notes.push('• <code>console.log()</code> → <code>print()</code>');
  notes.push('• <code>true/false/null</code> → <code>True/False/None</code>');
  notes.push('• <code>===</code>/<code>!==</code> → <code>==</code>/<code>!=</code>');
  notes.push('• <strong>.length</strong> → use <code>len()</code> in Python (converted to <code>.__len__()</code> — review manually)');
  notes.push('• <strong>Manual review needed:</strong> Destructuring, spread operator, Promises/async, Array methods like <code>.map()</code>, <code>.filter()</code>');
  return { code: out, notes };
}

function pythonToJava(code) {
  const notes = [];
  let out = code;
  out = out.replace(/"""([\s\S]*?)"""/g, (_, s) => `/** ${s.trim()} */`);
  out = out.replace(/def (\w+)\((.*?)\)(?:\s*->\s*[\w\[\], \.]+)?\s*:/g, (_, name, params) => {
    const cleanParams = params.replace(/:\s*[\w\[\], \.]+/g, '').trim();
    const paramList = cleanParams ? cleanParams.split(',').map(p => `Object ${p.trim()}`).join(', ') : '';
    return `public static Object ${toCamel(name)}(${paramList}) {`;
  });
  out = out.replace(/class (\w+)(?:\((\w+)\))?:/g, (_, name, parent) =>
    parent ? `public class ${name} extends ${parent} {` : `public class ${name} {`);
  out = out.replace(/f"(.*?)"/g, (_, s) => `"${s.replace(/\{(\w+)\}/g, '" + $1 + "')}"`);
  out = out.replace(/print\((.*?)\)/g, 'System.out.println($1)');
  out = out.replace(/\bTrue\b/g, 'true'); out = out.replace(/\bFalse\b/g, 'false'); out = out.replace(/\bNone\b/g, 'null');
  out = out.replace(/\belif\b/g, 'else if'); out = out.replace(/\band\b/g, '&&'); out = out.replace(/\bor\b/g, '||');
  out = out.replace(/len\((\w+)\)/g, '$1.length');
  out = out.replace(/for (\w+) in range\((\d+)\):/g, 'for (int $1 = 0; $1 < $2; $1++) {');
  out = out.replace(/for (\w+) in range\((\w+),\s*(\w+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
  out = out.replace(/for (\w+) in (\w+):/g, 'for (Object $1 : $2) {');
  out = out.replace(/while (.+?):/g, 'while ($1) {'); out = out.replace(/if (.+?):/g, 'if ($1) {'); out = out.replace(/else:/g, '} else {');
  out = convertIndentToBraces(out);
  if (!/class\s+\w+/.test(out)) out = `public class Main {\n${reindent(out, 4)}\n}`;
  notes.push('• Parameters typed as <code>Object</code> — replace with proper types');
  notes.push('• <code>print()</code> → <code>System.out.println()</code>');
  notes.push('• Code wrapped in <code>public class Main</code> if no class found');
  notes.push('• <strong>Manual review needed:</strong> Add proper return types, variable types, imports, and main method');
  return { code: out, notes };
}

function javascriptToTypeScript(code) {
  const notes = [];
  let out = code;
  out = out.replace(/function (\w+)\s*\((.*?)\)/g, (_, name, params) => {
    const typed = params.split(',').map(p => {
      p = p.trim(); if (!p) return p;
      if (p.includes('=')) { const [n, v] = p.split('=').map(s => s.trim()); return `${n}: ${inferType(v)} = ${v}`; }
      return `${p}: unknown`;
    }).join(', ');
    return `function ${name}(${typed}): unknown`;
  });
  out = out.replace(/^(\s*)(const|let)\s+(\w+)\s*=\s*(.+)$/gm, (match, indent, kw, name, val) => {
    const type = inferType(val.trim().replace(/;$/, ''));
    if (type !== 'unknown') return `${indent}${kw} ${name}: ${type} = ${val}`;
    return match;
  });
  out = out.replace(/const (\w+)\s*=\s*\{/g, '// TODO: define interface for $1\nconst $1 = {');
  notes.push('• Function parameters annotated with <code>: unknown</code> — replace with proper types');
  notes.push('• Basic type inference applied to <code>const</code>/<code>let</code> declarations');
  notes.push('• <strong>Manual review needed:</strong> Generics, union types, interface definitions, and return types');
  return { code: out, notes };
}

function inferType(val) {
  if (!val) return 'unknown';
  if (val === 'true' || val === 'false') return 'boolean';
  if (/^\d+$/.test(val)) return 'number';
  if (/^\d+\.\d+$/.test(val)) return 'number';
  if (/^["'`]/.test(val)) return 'string';
  if (val.startsWith('[')) return 'unknown[]';
  if (val.startsWith('{')) return 'Record<string, unknown>';
  return 'unknown';
}

function typescriptToJavaScript(code) {
  const notes = [];
  let out = code;
  out = out.replace(/:\s*[\w<>\[\]|&, \.]+(?=\s*[,)={])/g, '');
  out = out.replace(/\)\s*:\s*[\w<>\[\]|&, \.]+\s*\{/g, ') {');
  out = out.replace(/interface\s+\w+\s*\{[^}]*\}/gs, '// (interface removed)');
  out = out.replace(/type\s+\w+\s*=[\w<>\[\]|&, \.]+;/g, '');
  out = out.replace(/\b(public|private|protected|readonly)\s+/g, '');
  out = out.replace(/\s+as\s+[\w<>\[\]]+/g, '');
  out = out.replace(/<[\w, ]+>/g, '');
  out = out.replace(/(\w+)!/g, '$1');
  notes.push('• Type annotations removed');
  notes.push('• Interface and type alias definitions removed');
  notes.push('• <code>public/private/readonly</code> access modifiers removed');
  notes.push('• Review output as complex generic types may produce unexpected results');
  return { code: out, notes };
}

function pythonToGo(code) {
  const notes = [];
  let out = code;
  out = out.replace(/"""([\s\S]*?)"""/g, (_, s) => `// ${s.trim().replace(/\n/g, '\n// ')}`);
  out = out.replace(/def (\w+)\((.*?)\)(?:\s*->\s*([\w\[\], \.]+))?\s*:/g, (_, name, params, ret) => {
    const paramList = params.split(',').map(p => {
      const parts = p.trim().split(':');
      const pname = parts[0].trim();
      const ptype = parts[1] ? goType(parts[1].trim()) : 'interface{}';
      return pname ? `${toCamel(pname)} ${ptype}` : '';
    }).filter(Boolean).join(', ');
    const retType = ret ? goType(ret.trim()) : 'interface{}';
    return `func ${capitalize(name)}(${paramList}) ${retType} {`;
  });
  out = out.replace(/class (\w+)(?:\((\w+)\))?:/g, 'type $1 struct {');
  out = out.replace(/print\((.*?)\)/g, 'fmt.Println($1)');
  out = out.replace(/f"(.*?)"/g, (_, s) => {
    const fmtStr = s.replace(/\{(\w+)\}/g, '%v');
    const vars = [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).join(', ');
    return vars ? `fmt.Sprintf("${fmtStr}", ${vars})` : `"${s}"`;
  });
  out = out.replace(/\bTrue\b/g, 'true'); out = out.replace(/\bFalse\b/g, 'false'); out = out.replace(/\bNone\b/g, 'nil');
  out = out.replace(/\belif\b/g, '} else if'); out = out.replace(/\band\b/g, '&&'); out = out.replace(/\bor\b/g, '||');
  out = out.replace(/for (\w+) in range\((\d+)\):/g, 'for $1 := 0; $1 < $2; $1++ {');
  out = out.replace(/for (\w+) in range\((\w+),\s*(\w+)\):/g, 'for $1 := $2; $1 < $3; $1++ {');
  out = out.replace(/for (\w+) in (\w+):/g, 'for _, $1 := range $2 {');
  out = out.replace(/while (.+?):/g, 'for $1 {'); out = out.replace(/if (.+?):/g, 'if $1 {'); out = out.replace(/else:/g, '} else {');
  out = convertIndentToBraces(out);
  out = out.replace(/^(\s*)([a-z_]\w*)\s*=\s*(.+)$/gm, (match, indent, name, val) => {
    if (/^(if|else|for|func|type|return|\/\/|var\s)/.test(match.trim())) return match;
    return `${indent}${name} := ${val}`;
  });
  if (!/^func /m.test(out)) out = `package main\n\nimport "fmt"\n\nfunc main() {\n${reindent(out, 4)}\n}`;
  else out = `package main\n\nimport (\n    "fmt"\n    "math"\n)\n\n` + out;
  notes.push('• Functions converted: <code>def</code> → <code>func</code>');
  notes.push('• Variable assignment uses <code>:=</code> short declaration');
  notes.push('• <strong>Manual review needed:</strong> Error handling, goroutines, struct methods, and imports');
  return { code: out, notes };
}
function goType(t) {
  const map = {str:'string',int:'int',float:'float64',bool:'bool',list:'[]interface{}',dict:'map[string]interface{}'};
  return map[t.toLowerCase()] || 'interface{}';
}

function javascriptToPhp(code) {
  const notes = [];
  let out = code;
  out = out.replace(/function (\w+)\s*\((.*?)\)\s*\{/g, 'function $1($2) {');
  out = out.replace(/\b(const|let|var)\s+(\w+)/g, (_, __, name) => `$${name}`);
  out = out.replace(/console\.log\((.*?)\)/g, 'echo $1');
  out = out.replace(/\btrue\b/g, 'true'); out = out.replace(/\bfalse\b/g, 'false'); out = out.replace(/\bnull\b/g, 'null');
  out = out.replace(/`([\s\S]*?)`/g, (_, s) => '"' + s.replace(/\$\{(\w+)\}/g, '${$$1}') + '"');
  out = `<?php\n\n` + out;
  notes.push('• Variables prefixed with <code>$</code>');
  notes.push('• <code>console.log()</code> → <code>echo</code>');
  notes.push('• Added <code><?php</code> opening tag');
  notes.push('• <strong>Manual review needed:</strong> String methods, array functions, class syntax, and namespaces');
  return { code: out, notes };
}

function pythonToRuby(code) {
  const notes = [];
  let out = code;
  out = out.replace(/"""([\s\S]*?)"""/g, (_, s) => `=begin\n${s.trim()}\n=end`);
  out = out.replace(/def (\w+)\((.*?)\)(?:\s*->\s*[\w\[\], \.]+)?\s*:/g, 'def $1($2)');
  out = out.replace(/class (\w+)(?:\((\w+)\))?:/g, (_, name, parent) => parent ? `class ${name} < ${parent}` : `class ${name}`);
  out = out.replace(/f"(.*?)"/g, (_, s) => '"' + s.replace(/\{(\w+)\}/g, '#{$1}') + '"');
  out = out.replace(/print\((.*?)\)/g, 'puts $1');
  out = out.replace(/\bTrue\b/g, 'true'); out = out.replace(/\bFalse\b/g, 'false'); out = out.replace(/\bNone\b/g, 'nil');
  out = out.replace(/\belif\b/g, 'elsif'); out = out.replace(/\band\b/g, '&&'); out = out.replace(/\bor\b/g, '||');
  out = out.replace(/len\((\w+)\)/g, '$1.length');
  out = out.replace(/for (\w+) in range\((\d+)\):/g, '$2.times do |$1|');
  out = out.replace(/for (\w+) in range\((\w+),\s*(\w+)\):/g, '($2...$3).each do |$1|');
  out = out.replace(/for (\w+) in (\w+):/g, '$2.each do |$1|');
  out = out.replace(/while (.+?):/g, 'while $1'); out = out.replace(/if (.+?):/g, 'if $1'); out = out.replace(/else:/g, 'else');
  out = convertIndentToEnd(out);
  notes.push('• <code>print()</code> → <code>puts</code>; f-strings → Ruby string interpolation');
  notes.push('• <code>elif</code> → <code>elsif</code>; blocks end with <code>end</code>');
  notes.push('• <strong>Manual review needed:</strong> Symbols, hashes, blocks/procs, modules');
  return { code: out, notes };
}

function javaToPython(code) {
  const notes = [];
  let out = code;
  out = out.replace(/public\s+class\s+\w+\s*(?:extends\s+\w+)?\s*\{([\s\S]*)\}/m, '$1');
  out = out.replace(/(?:public|private|protected|static|final|\s)+[\w<>\[\]]+\s+(\w+)\s*\((.*?)\)\s*\{/g, (_, name, params) => {
    const cleanParams = params.replace(/[\w<>\[\]]+\s+(\w+)/g, '$1');
    return `def ${toSnake(name)}(${cleanParams}):`;
  });
  out = out.replace(/System\.out\.println\((.*?)\)/g, 'print($1)');
  out = out.replace(/System\.out\.print\((.*?)\)/g, 'print($1, end="")');
  out = out.replace(/\btrue\b/g, 'True'); out = out.replace(/\bfalse\b/g, 'False'); out = out.replace(/\bnull\b/g, 'None');
  out = out.replace(/\s*&&\s*/g, ' and '); out = out.replace(/\s*\|\|\s*/g, ' or ');
  out = out.replace(/\.toUpperCase\(\)/g, '.upper()'); out = out.replace(/\.toLowerCase\(\)/g, '.lower()'); out = out.replace(/\.trim\(\)/g, '.strip()');
  out = out.replace(/String\.valueOf\((.*?)\)/g, 'str($1)'); out = out.replace(/Integer\.parseInt\((.*?)\)/g, 'int($1)');
  out = out.replace(/Math\.sqrt\((.*?)\)/g, 'math.sqrt($1)'); out = out.replace(/Math\.pow\((.*?),(.*?)\)/g, '$1 ** $2');
  out = out.replace(/for\s*\(int\s+(\w+)\s*=\s*0;\s*\1\s*<\s*(\w+);\s*\1\+\+\)/g, 'for $1 in range($2):');
  out = out.replace(/for\s*\(int\s+(\w+)\s*=\s*(\w+);\s*\1\s*<\s*(\w+);\s*\1\+\+\)/g, 'for $1 in range($2, $3):');
  out = out.replace(/for\s*\(\w+\s+(\w+)\s*:\s*(\w+)\)/g, 'for $1 in $2:');
  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while $1:');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if $1:');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, 'elif $1:');
  out = out.replace(/\}\s*else\s*\{/g, 'else:');
  out = out.replace(/\b(?:int|double|float|long|char|boolean|String|void|byte|short)\s+(\w+)/g, '$1');
  out = out.replace(/;$/gm, '');
  out = convertBracesToIndent(out);
  notes.push('• Class wrapper removed; methods → functions'); notes.push('• <code>System.out.println()</code> → <code>print()</code>');
  notes.push('• <strong>Manual review needed:</strong> Generics, exceptions, interfaces, imports');
  return { code: out, notes };
}

function javascriptToKotlin(code) {
  const notes = [];
  let out = code;
  out = out.replace(/function (\w+)\s*\((.*?)\)\s*\{/g, 'fun $1($2): Any {');
  out = out.replace(/const\s+(\w+)\s*=/g, 'val $1 =');
  out = out.replace(/let\s+(\w+)\s*=/g, 'var $1 =');
  out = out.replace(/var\s+(\w+)\s*=/g, 'var $1 =');
  out = out.replace(/console\.log\((.*?)\)/g, 'println($1)');
  out = out.replace(/\btrue\b/g, 'true'); out = out.replace(/\bfalse\b/g, 'false'); out = out.replace(/\bnull\b/g, 'null');
  out = out.replace(/\.length/g, '.size'); out = out.replace(/\.push\((.*?)\)/g, '.add($1)'); out = out.replace(/\.pop\(\)/g, '.removeLast()');
  out = out.replace(/\.toUpperCase\(\)/g, '.uppercase()'); out = out.replace(/\.toLowerCase\(\)/g, '.lowercase()');
  out = out.replace(/for\s*\((?:const|let|var)\s+(\w+)\s+of\s+(\w+)\)\s*\{/g, 'for ($1 in $2) {');
  out = out.replace(/for\s*\((?:let|var)\s+(\w+)\s*=\s*0;\s*\1\s*<\s*(\w+);\s*\1\+\+\)\s*\{/g, 'for ($1 in 0 until $2) {');
  out = out.replace(/`([\s\S]*?)`/g, (_, s) => '"' + s.replace(/\$\{(\w+)\}/g, '${$1}') + '"');
  out = out.replace(/;$/gm, '');
  notes.push('• <code>function</code> → <code>fun</code>, <code>const</code> → <code>val</code>, <code>let</code> → <code>var</code>');
  notes.push('• <code>console.log()</code> → <code>println()</code>; <code>.length</code> → <code>.size</code>');
  notes.push('• <strong>Manual review needed:</strong> Data classes, null safety, coroutines, type annotations');
  return { code: out, notes };
}

function pythonToCSharp(code) {
  const notes = [];
  let out = code;
  out = out.replace(/"""([\s\S]*?)"""/g, (_, s) => `/// <summary>\n/// ${s.trim()}\n/// </summary>`);
  out = out.replace(/def (\w+)\((.*?)\)(?:\s*->\s*([\w\[\], \.]+))?\s*:/g, (_, name, params) => {
    const paramList = params.split(',').map(p => { p = p.trim().replace(/:\s*[\w\[\]\.]+/g, '').trim(); return p ? `object ${p}` : ''; }).filter(Boolean).join(', ');
    return `public static object ${capitalize(name)}(${paramList}) {`;
  });
  out = out.replace(/class (\w+)(?:\((\w+)\))?:/g, (_, name, parent) => parent ? `public class ${name} : ${parent} {` : `public class ${name} {`);
  out = out.replace(/f"(.*?)"/g, (_, s) => '$"' + s.replace(/\{(\w+)\}/g, '{$1}') + '"');
  out = out.replace(/print\((.*?)\)/g, 'Console.WriteLine($1)');
  out = out.replace(/\bTrue\b/g, 'true'); out = out.replace(/\bFalse\b/g, 'false'); out = out.replace(/\bNone\b/g, 'null');
  out = out.replace(/\belif\b/g, 'else if'); out = out.replace(/\band\b/g, '&&'); out = out.replace(/\bor\b/g, '||');
  out = out.replace(/len\((\w+)\)/g, '$1.Length');
  out = out.replace(/for (\w+) in range\((\d+)\):/g, 'for (int $1 = 0; $1 < $2; $1++) {');
  out = out.replace(/for (\w+) in (\w+):/g, 'foreach (var $1 in $2) {');
  out = out.replace(/while (.+?):/g, 'while ($1) {'); out = out.replace(/if (.+?):/g, 'if ($1) {'); out = out.replace(/else:/g, '} else {');
  out = convertIndentToBraces(out);
  if (!/class\s+\w+/.test(out)) out = `public class Program {\n${reindent(out, 4)}\n}`;
  notes.push('• Python f-strings → C# interpolated strings (<code>$"..."</code>)');
  notes.push('• <code>print()</code> → <code>Console.WriteLine()</code>');
  notes.push('• <strong>Manual review needed:</strong> LINQ, generics, namespaces, using directives, async/await');
  return { code: out, notes };
}

function pythonToRust(code) {
  const notes = [];
  let out = code;
  out = out.replace(/"""([\s\S]*?)"""/g, (_, s) => `/// ${s.trim().split('\n').join('\n/// ')}`);
  out = out.replace(/def (\w+)\((.*?)\)(?:\s*->\s*([\w\[\], \.]+))?\s*:/g, (_, name, params) => {
    const paramList = params.split(',').map(p => { p = p.trim().replace(/:\s*[\w\[\]\.]+/g, '').trim(); return p ? `${toSnake(p)}: i32` : ''; }).filter(Boolean).join(', ');
    return `fn ${toSnake(name)}(${paramList}) -> i32 {`;
  });
  out = out.replace(/print\((.*?)\)/g, 'println!("{}", $1)');
  out = out.replace(/\bTrue\b/g, 'true'); out = out.replace(/\bFalse\b/g, 'false'); out = out.replace(/\bNone\b/g, 'None');
  out = out.replace(/\belif\b/g, '} else if'); out = out.replace(/\band\b/g, '&&'); out = out.replace(/\bor\b/g, '||');
  out = out.replace(/for (\w+) in range\((\d+)\):/g, 'for $1 in 0..$2 {');
  out = out.replace(/for (\w+) in range\((\w+),\s*(\w+)\):/g, 'for $1 in $2..$3 {');
  out = out.replace(/for (\w+) in (\w+):/g, 'for $1 in &$2 {');
  out = out.replace(/while (.+?):/g, 'while $1 {'); out = out.replace(/if (.+?):/g, 'if $1 {'); out = out.replace(/else:/g, '} else {');
  out = convertIndentToBraces(out);
  out = `fn main() {\n${reindent(out, 4)}\n}`;
  notes.push('• Functions converted; all types defaulted to <code>i32</code> — must be updated');
  notes.push('• <code>print()</code> → <code>println!()</code> macro');
  notes.push('• <strong>Manual review needed:</strong> Ownership, borrowing, lifetimes, Option/Result types');
  return { code: out, notes };
}

/* ────────────────────────────────────────────
   INDENT CONVERSION HELPERS
──────────────────────────────────────────── */
function convertIndentToBraces(code) {
  const lines = code.split('\n');
  const result = [];
  const indentStack = [0];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (!trimmed) { result.push(''); continue; }
    const currentIndent = line.length - trimmed.length;
    while (indentStack.length > 1 && indentStack[indentStack.length - 1] > currentIndent) {
      indentStack.pop();
      result.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
    }
    result.push(line);
    if (trimmed.endsWith('{')) indentStack.push(currentIndent + 2);
  }
  while (indentStack.length > 1) {
    indentStack.pop();
    result.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
  }
  return result.join('\n');
}

function convertBracesToIndent(code) {
  const lines = code.split('\n');
  const result = [];
  let indent = 0;
  const STEP = 4;
  for (const line of lines) {
    let trimmed = line.trim();
    if (!trimmed) { result.push(''); continue; }
    const closingMatch = trimmed.match(/^(\}+)/);
    if (closingMatch) { indent -= closingMatch[1].length * STEP; if (indent < 0) indent = 0; trimmed = trimmed.slice(closingMatch[1].length).trim(); if (!trimmed) continue; }
    if (/^\} ?else/.test(trimmed)) { indent -= STEP; trimmed = trimmed.replace(/^\}/, '').trim(); }
    result.push(' '.repeat(Math.max(0, indent)) + trimmed.replace(/\s*\{$/, ':').replace(/\}$/, ''));
    const opens = (trimmed.match(/\{/g) || []).length;
    const closes = (trimmed.match(/\}/g) || []).length;
    indent += (opens - closes) * STEP;
    if (indent < 0) indent = 0;
  }
  return result.join('\n');
}

function convertIndentToEnd(code) {
  const lines = code.split('\n');
  const result = [];
  const indentStack = [0];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (!trimmed) { result.push(''); continue; }
    const currentIndent = line.length - trimmed.length;
    while (indentStack.length > 1 && indentStack[indentStack.length - 1] > currentIndent) {
      indentStack.pop();
      result.push(' '.repeat(indentStack[indentStack.length - 1]) + 'end');
    }
    result.push(line);
    const needsEnd = /^(def |class |if |elsif |else$|while |for |do$|do \|)/.test(trimmed);
    if (needsEnd && i < lines.length - 1) {
      const nextLine = lines[i + 1] || '';
      const nextIndent = nextLine.length - nextLine.trimStart().length;
      if (nextIndent > currentIndent) indentStack.push(currentIndent + 2);
    }
  }
  while (indentStack.length > 1) { indentStack.pop(); result.push(' '.repeat(indentStack[indentStack.length - 1]) + 'end'); }
  return result.join('\n');
}

/* ────────────────────────────────────────────
   CONVERSION REGISTRY
──────────────────────────────────────────── */
const CONVERTERS = {
  'python-javascript':  pythonToJavaScript,
  'python-java':        pythonToJava,
  'python-go':          pythonToGo,
  'python-ruby':        pythonToRuby,
  'python-csharp':      pythonToCSharp,
  'python-rust':        pythonToRust,
  'javascript-python':  javascriptToPython,
  'javascript-typescript': javascriptToTypeScript,
  'javascript-php':     javascriptToPhp,
  'javascript-kotlin':  javascriptToKotlin,
  'typescript-javascript': typescriptToJavaScript,
  'java-python':        javaToPython,
};

const SUPPORT_PAIRS = [
  {from:'Python',to:'JavaScript',quality:'high'},
  {from:'Python',to:'Java',quality:'medium'},
  {from:'Python',to:'Go',quality:'medium'},
  {from:'Python',to:'Ruby',quality:'high'},
  {from:'Python',to:'C#',quality:'medium'},
  {from:'Python',to:'Rust',quality:'partial'},
  {from:'JavaScript',to:'Python',quality:'high'},
  {from:'JavaScript',to:'TypeScript',quality:'high'},
  {from:'JavaScript',to:'PHP',quality:'medium'},
  {from:'JavaScript',to:'Kotlin',quality:'medium'},
  {from:'TypeScript',to:'JavaScript',quality:'high'},
  {from:'Java',to:'Python',quality:'high'},
];

function renderSupportGrid() {
  const grid = document.getElementById('supportGrid');
  const qualityLabel = {high:'High Coverage',medium:'Medium Coverage',partial:'Partial'};
  grid.innerHTML = SUPPORT_PAIRS.map(p => `
    <div class="support-card">
      <div class="support-pair">${p.from} → ${p.to}</div>
      <span class="support-quality q-${p.quality}">${qualityLabel[p.quality]}</span>
    </div>`).join('');
}

/* ────────────────────────────────────────────
   SYNTAX HIGHLIGHTING
   Key change: only add .hl-active (which makes
   textarea text transparent) AFTER successfully
   rendering highlighted HTML into the layer.
   Falls back gracefully if HLJS is unavailable.
──────────────────────────────────────────── */
function highlightCode(code, langKey, codeElId) {
  const codeEl = document.getElementById(codeElId);
  if (!codeEl) return;

  // Determine which textarea this highlight layer belongs to
  const isSource = codeElId === 'srcHlCode';
  const textareaId = isSource ? 'sourceCode' : 'outputCode';
  const textarea = document.getElementById(textareaId);

  if (!HLJS_AVAILABLE || !code.trim()) {
    // No HLJS or empty: show plain textarea text
    codeEl.innerHTML = '';
    if (textarea) textarea.classList.remove('hl-active');
    return;
  }

  const alias = HLJS_LANG[langKey] || 'plaintext';
  try {
    const result = hljs.highlight(code, { language: alias, ignoreIllegals: true });
    codeEl.innerHTML = result.value;
    // Only now make textarea transparent — HLJS successfully rendered
    if (textarea) textarea.classList.add('hl-active');
  } catch(e) {
    codeEl.textContent = code;
    if (textarea) textarea.classList.remove('hl-active');
  }
}

function syncScrollHL(textareaId, layerId) {
  const ta = document.getElementById(textareaId);
  const layer = document.getElementById(layerId);
  if (!ta || !layer) return;
  ta.addEventListener('scroll', () => {
    layer.scrollTop = ta.scrollTop;
    layer.scrollLeft = ta.scrollLeft;
  });
}

/* ────────────────────────────────────────────
   CORE CONVERT
──────────────────────────────────────────── */
function convert() {
  const source = document.getElementById('sourceCode').value.trim();
  const from   = document.getElementById('sourceLang').value;
  const to     = document.getElementById('targetLang').value;
  if (!source) { toast('Please enter some source code first.', 'error'); return; }
  if (from === to) { toast('Source and target languages are the same.', 'error'); return; }
  const key = `${from}-${to}`;
  const converter = CONVERTERS[key];
  hideError();
  document.getElementById('notesCard').classList.remove('visible');
  document.getElementById('outputCode').value = '';
  document.getElementById('outHlCode').innerHTML = '';
  document.getElementById('outputCode').classList.remove('hl-active');
  if (!converter) {
    const reverseKey = `${to}-${from}`;
    if (CONVERTERS[reverseKey]) showError(`Direct ${capitalize(from)} → ${capitalize(to)} conversion isn't available, but ${capitalize(to)} → ${capitalize(from)} is! Try swapping languages.`);
    else showError(`Conversion from ${capitalize(from)} to ${capitalize(to)} is not yet supported. Supported pairs: ${SUPPORT_PAIRS.map(p=>p.from+'→'+p.to).join(', ')}.`);
    return;
  }
  startProgress();
  try {
    const result = converter(source);
    const { code, notes } = result;
    document.getElementById('outputCode').value = code;
    document.getElementById('outputOverlay').classList.add('hidden');
    highlightCode(code, to, 'outHlCode');
    updateLineNumbers('outputCode', 'outLineNums');
    updateTokenCounts();
    if (notes && notes.length && settings.showNotes) {
      const html = '<ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:8px">' +
        notes.map(n => `<li style="display:flex;gap:8px"><span style="color:var(--accent-a);flex-shrink:0">▸</span><span>${n}</span></li>`).join('') + '</ul>';
      document.getElementById('notesContent').innerHTML = html;
      document.getElementById('notesCard').classList.add('visible', 'slide-up');
    }
    document.getElementById('copyResultBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = false;
    addToHistory(source, code, from, to, notes ? notes.join('\n') : '');
    conversionCount++;
    localStorage.setItem('cxc_count', conversionCount);
    animateNumber('statConversions', conversionCount - 1, conversionCount, 400);
    toast(`Converted ${capitalize(from)} → ${capitalize(to)} successfully!`, 'success');
  } catch(err) {
    showError('Conversion error: ' + (err.message || 'Unknown error. Please check your code.'));
    toast('Conversion encountered an error.', 'error');
  } finally {
    completeProgress();
  }
}

/* ────────────────────────────────────────────
   THEME & SETTINGS
──────────────────────────────────────────── */
let settings = { theme:'dark', fontSize:13, tabSize:2, showNotes:true };
let conversionHistory = [];
let conversionCount = parseInt(localStorage.getItem('cxc_count') || '0');

function setTheme(t) {
  const isDark = t === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : t === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const darkLink = document.getElementById('hlThemeDark');
  const lightLink = document.getElementById('hlThemeLight');
  if (darkLink) darkLink.disabled = !isDark;
  if (lightLink) lightLink.disabled = isDark;
  settings.theme = t;
  saveSettings();
  ['themeDark','themeLight','themeSystem'].forEach(id => document.getElementById(id)?.classList.remove('active'));
  const themeMap = {dark:'themeDark',light:'themeLight',system:'themeSystem'};
  document.getElementById(themeMap[t])?.classList.add('active');
  document.getElementById('themeIconSun').style.display = isDark ? 'block' : 'none';
  document.getElementById('themeIconMoon').style.display = isDark ? 'none' : 'block';
  // Re-highlight to pick up new colour scheme
  const srcCode = document.getElementById('sourceCode').value;
  const outCode = document.getElementById('outputCode').value;
  if (srcCode) highlightCode(srcCode, document.getElementById('sourceLang').value, 'srcHlCode');
  if (outCode) highlightCode(outCode, document.getElementById('targetLang').value, 'outHlCode');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function saveSettings() { try { localStorage.setItem('cxc_settings', JSON.stringify(settings)); } catch(e) {} }

function loadSettings() {
  try { const s = localStorage.getItem('cxc_settings'); if (s) Object.assign(settings, JSON.parse(s)); } catch(e) {}
  setTheme(settings.theme);
  applyFontSize(settings.fontSize);
  const fsr = document.getElementById('fontSizeRange');
  const fsv = document.getElementById('fontSizeVal');
  if (fsr) fsr.value = settings.fontSize;
  if (fsv) fsv.textContent = settings.fontSize;
  const ts = document.getElementById('tabSizeSelect');
  if (ts) ts.value = settings.tabSize;
  if (!settings.showNotes) {
    document.getElementById('notesOn')?.classList.remove('active');
    document.getElementById('notesOff')?.classList.add('active');
  }
}

function applyFontSize(size) {
  const lh = (size * 1.7) + 'px';
  document.querySelectorAll('.code-textarea, .hl-layer, .hl-layer pre, .hl-layer code').forEach(el => {
    el.style.fontSize = size + 'px';
    el.style.lineHeight = lh;
  });
  document.querySelectorAll('.line-numbers').forEach(el => {
    el.style.fontSize = size + 'px';
    el.style.lineHeight = lh;
  });
}

function setNotesVisible(v) {
  settings.showNotes = v;
  saveSettings();
  document.getElementById('notesOn')?.classList.toggle('active', v);
  document.getElementById('notesOff')?.classList.toggle('active', !v);
  if (!v) document.getElementById('notesCard').classList.remove('visible');
}

/* ────────────────────────────────────────────
   UI HELPERS
──────────────────────────────────────────── */
function syncLangBadges() {
  const src = document.getElementById('sourceLang').value;
  const tgt = document.getElementById('targetLang').value;
  document.getElementById('sourceLangLabel').textContent = capitalize(src);
  document.getElementById('targetLangLabel').textContent = capitalize(tgt);
  document.getElementById('sourceDot').style.background = LANG_COLORS[src] || '#888';
  document.getElementById('targetDot').style.background = LANG_COLORS[tgt] || '#888';
}

function updateLineNumbers(textareaId, lineNumId) {
  const ta = document.getElementById(textareaId);
  const ln = document.getElementById(lineNumId);
  if (!ta || !ln) return;
  const lines = (ta.value.match(/\n/g) || []).length + 1;
  let html = '';
  for (let i = 1; i <= lines; i++) html += `<span>${i}</span>`;
  ln.innerHTML = html;
}

function updateTokenCounts() {
  const src = document.getElementById('sourceCode').value;
  const out = document.getElementById('outputCode').value;
  document.getElementById('srcLines').textContent = src ? src.split('\n').length : 0;
  document.getElementById('srcChars').textContent = src.length;
  document.getElementById('outLines').textContent = out ? out.split('\n').length : 0;
  document.getElementById('outChars').textContent = out.length;
}

function updateStatCounter() { animateNumber('statConversions', 0, conversionCount, 800); }

function animateNumber(id, from, to, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = Date.now();
  const tick = () => {
    const p = Math.min((Date.now() - start) / duration, 1);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function startProgress() {
  const bar = document.getElementById('progressBar');
  bar.style.width = '0%';
  setTimeout(() => { bar.style.width = '100%'; setTimeout(() => { bar.style.width = '0%'; }, 300); }, 10);
}
function completeProgress() {
  const bar = document.getElementById('progressBar');
  bar.style.width = '100%';
  setTimeout(() => { bar.style.width = '0%'; }, 500);
}

function toast(msg, type = 'info') {
  const icons = {
    success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<div class="toast-icon">${icons[type]}</div><div class="toast-msg">${msg}</div>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 200); }, 3200);
}

function showError(msg) {
  const card = document.getElementById('errorCard');
  document.getElementById('errorText').textContent = msg;
  card.classList.add('visible', 'slide-up');
}
function hideError() { document.getElementById('errorCard').classList.remove('visible'); }

/* ────────────────────────────────────────────
   HISTORY
──────────────────────────────────────────── */
function loadHistory() { try { conversionHistory = JSON.parse(localStorage.getItem('cxc_history') || '[]'); } catch(e) { conversionHistory = []; } }
function saveHistory() { try { if (conversionHistory.length > 20) conversionHistory = conversionHistory.slice(-20); localStorage.setItem('cxc_history', JSON.stringify(conversionHistory)); } catch(e) {} }
function addToHistory(src, out, from, to, notes) {
  conversionHistory.push({ id: Date.now(), from, to, src: src.slice(0,500), out: out.slice(0,500), notes, time: new Date().toISOString() });
  saveHistory(); renderHistory();
}

function renderHistory() {
  const grid = document.getElementById('historyGrid');
  if (!grid) return;
  if (conversionHistory.length === 0) {
    grid.innerHTML = '<div class="history-empty">No conversions yet. Make your first conversion above!</div>';
    return;
  }
  grid.innerHTML = [...conversionHistory].reverse().slice(0,12).map(item => `
    <div class="history-item" onclick="loadHistoryItem(${item.id})">
      <div class="history-item-header">
        <div class="history-langs">
          <span class="history-lang" style="background:${LANG_COLORS[item.from]||'#555'}22;color:${LANG_COLORS[item.from]||'#888'}">${capitalize(item.from)}</span>
          <span class="history-arrow">→</span>
          <span class="history-lang" style="background:${LANG_COLORS[item.to]||'#555'}22;color:${LANG_COLORS[item.to]||'#888'}">${capitalize(item.to)}</span>
        </div>
        <span class="history-time">${timeAgo(item.time)}</span>
      </div>
      <div class="history-preview">${escapeHtml(item.src.slice(0,120))}</div>
    </div>`).join('');
}

function loadHistoryItem(id) {
  const item = conversionHistory.find(h => h.id === id);
  if (!item) return;
  document.getElementById('sourceCode').value = item.src;
  document.getElementById('outputCode').value = item.out;
  document.getElementById('sourceLang').value = item.from;
  document.getElementById('targetLang').value = item.to;
  syncLangBadges();
  updateLineNumbers('sourceCode','srcLineNums');
  updateLineNumbers('outputCode','outLineNums');
  updateTokenCounts();
  highlightCode(item.src, item.from, 'srcHlCode');
  highlightCode(item.out, item.to, 'outHlCode');
  document.getElementById('outputOverlay').classList.add('hidden');
  document.getElementById('copyResultBtn').disabled = false;
  document.getElementById('downloadBtn').disabled = false;
  document.getElementById('converter').scrollIntoView({ behavior:'smooth' });
  toast('Loaded from history','info');
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s/60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}
function escapeHtml(str) { return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ────────────────────────────────────────────
   CLIPBOARD & DOWNLOAD
──────────────────────────────────────────── */
async function copyText(text, label) {
  try { await navigator.clipboard.writeText(text); toast(`${label} copied to clipboard!`, 'success'); }
  catch(e) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    toast(`${label} copied!`, 'success');
  }
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('sourceCode').value = text;
    highlightCode(text, document.getElementById('sourceLang').value, 'srcHlCode');
    updateLineNumbers('sourceCode','srcLineNums');
    updateTokenCounts();
    toast('Pasted from clipboard','success');
  } catch(e) { toast('Clipboard access denied. Please paste manually.','error'); }
}

function downloadOutput() {
  const code = document.getElementById('outputCode').value;
  if (!code) return;
  const lang = document.getElementById('targetLang').value;
  const ext = LANG_EXT[lang] || 'txt';
  const blob = new Blob([code], { type:'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `converted.${ext}`; a.click();
  URL.revokeObjectURL(a.href);
  toast(`Downloaded as converted.${ext}`, 'success');
}

/* ────────────────────────────────────────────
   SWAP / SAMPLE / CLEAR
──────────────────────────────────────────── */
function swapLangs() {
  const srcSel  = document.getElementById('sourceLang');
  const tgtSel  = document.getElementById('targetLang');
  const srcCode = document.getElementById('sourceCode').value;
  const outCode = document.getElementById('outputCode').value;
  const tmp = srcSel.value; srcSel.value = tgtSel.value; tgtSel.value = tmp;
  document.getElementById('sourceCode').value = outCode;
  document.getElementById('outputCode').value = srcCode;
  syncLangBadges();
  highlightCode(outCode, srcSel.value, 'srcHlCode');
  highlightCode(srcCode, tgtSel.value, 'outHlCode');
  updateLineNumbers('sourceCode','srcLineNums');
  updateLineNumbers('outputCode','outLineNums');
  updateTokenCounts();
  if (!outCode) document.getElementById('outputOverlay').classList.remove('hidden');
  else document.getElementById('outputOverlay').classList.add('hidden');
  toast('Languages swapped!','info');
}

function loadSample() {
  const lang = document.getElementById('sourceLang').value;
  const sample = SAMPLES[lang] || SAMPLES.javascript;
  document.getElementById('sourceCode').value = sample;
  highlightCode(sample, lang, 'srcHlCode');
  updateLineNumbers('sourceCode','srcLineNums');
  updateTokenCounts(); hideError();
  toast(`Loaded ${capitalize(lang)} sample`, 'info');
}

function clearAll() {
  document.getElementById('sourceCode').value = '';
  document.getElementById('outputCode').value = '';
  document.getElementById('srcHlCode').innerHTML = '';
  document.getElementById('outHlCode').innerHTML = '';
  // Remove hl-active so fallback colour shows
  document.getElementById('sourceCode').classList.remove('hl-active');
  document.getElementById('outputCode').classList.remove('hl-active');
  document.getElementById('outputOverlay').classList.remove('hidden');
  document.getElementById('notesCard').classList.remove('visible');
  document.getElementById('copyResultBtn').disabled = true;
  document.getElementById('downloadBtn').disabled = true;
  hideError();
  updateLineNumbers('sourceCode','srcLineNums');
  updateLineNumbers('outputCode','outLineNums');
  updateTokenCounts();
}

function clearHistory() {
  if (!confirm('Clear all conversion history?')) return;
  conversionHistory = []; saveHistory(); renderHistory();
  toast('History cleared','info');
}

/* ────────────────────────────────────────────
   SETTINGS MODAL
──────────────────────────────────────────── */
function openSettings() { document.getElementById('settingsModal').classList.add('open'); }
function closeSettings() { document.getElementById('settingsModal').classList.remove('open'); }

/* ────────────────────────────────────────────
   EVENT WIRING
──────────────────────────────────────────── */
function attachEvents() {
  document.getElementById('convertBtn').addEventListener('click', convert);
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); convert(); }
  });
  document.getElementById('swapBtn').addEventListener('click', swapLangs);
  document.getElementById('sourceLang').addEventListener('change', () => {
    syncLangBadges(); hideError();
    highlightCode(document.getElementById('sourceCode').value, document.getElementById('sourceLang').value, 'srcHlCode');
  });
  document.getElementById('targetLang').addEventListener('change', () => {
    syncLangBadges(); hideError();
    highlightCode(document.getElementById('outputCode').value, document.getElementById('targetLang').value, 'outHlCode');
  });
  document.getElementById('sourceCode').addEventListener('input', () => {
    const code = document.getElementById('sourceCode').value;
    const lang = document.getElementById('sourceLang').value;
    highlightCode(code, lang, 'srcHlCode');
    updateLineNumbers('sourceCode','srcLineNums');
    updateTokenCounts(); hideError();
  });
  document.querySelectorAll('.code-textarea').forEach(ta => {
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const spaces = ' '.repeat(settings.tabSize);
        const s = ta.selectionStart, end = ta.selectionEnd;
        ta.value = ta.value.slice(0,s) + spaces + ta.value.slice(end);
        ta.selectionStart = ta.selectionEnd = s + spaces.length;
        if (ta.id === 'sourceCode') {
          highlightCode(ta.value, document.getElementById('sourceLang').value, 'srcHlCode');
          updateLineNumbers('sourceCode','srcLineNums');
        }
      }
    });
  });
  syncScrollHL('sourceCode', 'srcHlLayer');
  syncScrollHL('outputCode', 'outHlLayer');
  document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
  document.getElementById('clearBtn').addEventListener('click', clearAll);
  document.getElementById('copyResultBtn').addEventListener('click', () => copyText(document.getElementById('outputCode').value,'Output code'));
  document.getElementById('downloadBtn').addEventListener('click', downloadOutput);
  document.getElementById('copyOutBtn').addEventListener('click', () => copyText(document.getElementById('outputCode').value,'Output code'));
  document.getElementById('copySrcBtn').addEventListener('click', () => copyText(document.getElementById('sourceCode').value,'Source code'));
  document.getElementById('pasteSrcBtn').addEventListener('click', pasteFromClipboard);
  document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  document.getElementById('closeSettings').addEventListener('click', closeSettings);
  document.getElementById('settingsModal').addEventListener('click', e => {
    if (e.target === document.getElementById('settingsModal')) closeSettings();
  });
  document.getElementById('fontSizeRange').addEventListener('input', e => {
    const val = parseInt(e.target.value);
    settings.fontSize = val;
    document.getElementById('fontSizeVal').textContent = val;
    applyFontSize(val); saveSettings();
  });
  document.getElementById('tabSizeSelect').addEventListener('change', e => {
    settings.tabSize = parseInt(e.target.value); saveSettings();
  });

  // Scroll spy
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector(`.nav-link[href="#${entry.target.id}"]`)?.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  ['converter','features','support','history'].forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

/* ────────────────────────────────────────────
   BOOT
──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadHistory();
  renderHistory();
  renderSupportGrid();
  updateStatCounter();
  attachEvents();
  updateLineNumbers('sourceCode','srcLineNums');
  updateLineNumbers('outputCode','outLineNums');
  updateTokenCounts();
  syncLangBadges();
});
