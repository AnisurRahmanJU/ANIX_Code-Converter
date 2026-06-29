
const HLJS_AVAILABLE = (typeof hljs !== 'undefined');

/* ────────────────────────────────────────────
   LANGUAGE CONFIG
──────────────────────────────────────────── */
const LANG_COLORS = {
  python:'#3572A5', javascript:'#f1e05a', typescript:'#3178c6', java:'#b07219',
  c:'#555555', cpp:'#f34b7d', csharp:'#178600', go:'#00ADD8', rust:'#DEA584',
  kotlin:'#A97BFF', php:'#4F5D95', ruby:'#701516', bash:'#89e051',
};
const LANG_EXT = {
  python:'py', javascript:'js', typescript:'ts', java:'java',
  c:'c', cpp:'cpp', csharp:'cs', go:'go', rust:'rs', kotlin:'kt', php:'php', ruby:'rb', bash:'sh',
};
const HLJS_LANG = {
  python:'python', javascript:'javascript', typescript:'typescript', java:'java',
  c:'c', cpp:'cpp', csharp:'csharp', go:'go', rust:'rust', kotlin:'kotlin',
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

/* ════════════════════════════════════════════
   C / C++ CONVERTERS  (high coverage)
   ════════════════════════════════════════════ */

// ── shared C/C++ parse helpers ────────────────
function cTypeToJs(t) {
  t = t.trim();
  if (/^(int|long|short|unsigned|signed|size_t|uint\w+|int\w+)/.test(t)) return 'number';
  if (/^(float|double)/.test(t)) return 'number';
  if (/^(char\s*\*|std::string|string)/.test(t)) return 'string';
  if (/^bool/.test(t)) return 'boolean';
  if (/\*/.test(t)) return 'unknown'; // pointer
  return 'unknown';
}
function cTypeToPy(t) {
  t = t.trim();
  if (/^(int|long|short|unsigned|signed|size_t|uint\w+|int\w+)/.test(t)) return 'int';
  if (/^(float|double)/.test(t)) return 'float';
  if (/^(char\s*\*|std::string|string)/.test(t)) return 'str';
  if (/^bool/.test(t)) return 'bool';
  return 'Any';
}
function cTypeToJava(t) {
  t = t.trim();
  if (/^(int|short|signed int)/.test(t)) return 'int';
  if (/^(long|long long|unsigned long)/.test(t)) return 'long';
  if (/^float/.test(t)) return 'float';
  if (/^double/.test(t)) return 'double';
  if (/^bool/.test(t)) return 'boolean';
  if (/^(char\s*\*|std::string|string)/.test(t)) return 'String';
  if (/^char$/.test(t)) return 'char';
  if (/^void/.test(t)) return 'void';
  return 'Object';
}
function stripCComments(code) {
  // block comments → preserve as //
  code = code.replace(/\/\*([\s\S]*?)\*\//g, (_, s) =>
    s.trim().split('\n').map(l => '// ' + l.trim()).join('\n'));
  return code;
}
// Extract C function signature parts: {retType, name, params}
function parseCFuncSig(line) {
  const m = line.match(/^([\w\s\*&:<>]+?)\s+(\w+)\s*\((.*?)\)\s*\{?\s*$/);
  if (!m) return null;
  return { retType: m[1].trim(), name: m[2].trim(), params: m[3].trim() };
}

// ── C → PYTHON ────────────────────────────────
function cToPython(code) {
  const notes = [];
  let out = code;

  // #include → import comment
  out = out.replace(/#include\s*[<"](\S+?)[>"]/g, (_, h) => {
    const map = {'stdio.h':'# import sys (was stdio.h)', 'stdlib.h':'# import sys (was stdlib.h)',
                 'string.h':'# (string.h not needed in Python)', 'math.h':'import math  # was math.h'};
    return map[h] || `# include <${h}>`;
  });
  // #define constants → uppercase vars
  out = out.replace(/#define\s+(\w+)\s+(.+)/g, '$1 = $2  # was #define');
  // Remove other preprocessor directives
  out = out.replace(/^#\w+.*$/gm, '');

  // Function definitions: ret type + name(params) {
  out = out.replace(/^([\w\s\*]+?)\s+(\w+)\s*\(([^)]*)\)\s*\{/gm, (match, ret, name, params) => {
    if (/^(if|else|for|while|switch|do)$/.test(name.trim())) return match;
    const pyParams = params.split(',').map(p => {
      p = p.trim(); if (!p || p === 'void') return '';
      const parts = p.replace(/\s*\*\s*/g, '* ').trim().split(/\s+/);
      return parts[parts.length - 1].replace('*','').replace('&','') || '';
    }).filter(Boolean).join(', ');
    return `def ${toSnake(name)}(${pyParams}):`;
  });

  // printf → print (basic)
  out = out.replace(/printf\s*\(\s*"(.*?)"\s*(?:,\s*(.*?))?\s*\)/g, (_, fmt, args) => {
    if (!args) return `print("${fmt.replace(/\\n/g,'').replace(/%[sd]/g,'{}')}")`;
    const argList = args.split(',').map(a=>a.trim());
    let i = 0;
    const pyFmt = fmt.replace(/\\n/g,'').replace(/%[-\d]*[sdifcu]/g, () => `{${argList[i++]||''}}`);
    return `print(f"${pyFmt}")`;
  });
  out = out.replace(/scanf\s*\([^)]*\)/g, '# input()  # was scanf');

  // malloc/calloc/free → Python doesn't need them
  out = out.replace(/\w+\s*\*\s*\w+\s*=\s*(?:malloc|calloc)\s*\([^)]*\)\s*;/g, '# (dynamic alloc — use list in Python)');
  out = out.replace(/free\s*\([^)]+\)\s*;/g, '# (free not needed in Python)');

  // NULL → None
  out = out.replace(/\bNULL\b/g, 'None');
  // bool
  out = out.replace(/\btrue\b/g, 'True');
  out = out.replace(/\bfalse\b/g, 'False');

  // Type casts: (int)x → int(x)
  out = out.replace(/\((int|float|double|char)\)\s*(\w+)/g, (_, t, v) => {
    const pyMap = {int:'int', float:'float', double:'float', char:'chr'};
    return `${pyMap[t]}(${v})`;
  });

  // for loops
  out = out.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\w+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\s*\+\+\s*\)\s*\{/g, 'for $1 in range($2, $3):');
  out = out.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\s*\+\+\s*\)\s*\{/g, 'for $1 in range($2):');
  out = out.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\w+)\s*;\s*\1\s*<=\s*(\w+)\s*;\s*\1\s*\+\+\s*\)\s*\{/g, 'for $1 in range($2, $3+1):');

  // while
  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while $1:');
  // if/else
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if $1:');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, 'elif $1:');
  out = out.replace(/\}\s*else\s*\{/g, 'else:');
  // switch → if/elif chain
  out = out.replace(/switch\s*\((\w+)\)\s*\{/g, '# switch($1):');
  out = out.replace(/case\s+([\w"']+)\s*:/g, 'if $1 ==  # case $1:');
  out = out.replace(/\bdefault\s*:/g, 'else:  # default');
  out = out.replace(/\bbreak\s*;/g, 'break');

  // arithmetic ops: keep same, but ** for pow
  out = out.replace(/pow\s*\(([^,]+),\s*([^)]+)\)/g, '($1 ** $2)');
  out = out.replace(/sqrt\s*\(/g, 'math.sqrt(');
  out = out.replace(/abs\s*\(/g, 'abs(');
  out = out.replace(/fabs\s*\(/g, 'abs(');

  // String functions
  out = out.replace(/strlen\s*\((\w+)\)/g, 'len($1)');
  out = out.replace(/strcpy\s*\((\w+),\s*(\w+)\)/g, '$1 = $2  # was strcpy');
  out = out.replace(/strcat\s*\((\w+),\s*(\w+)\)/g, '$1 += $2  # was strcat');
  out = out.replace(/strcmp\s*\((\w+),\s*(\w+)\)/g, '($1 == $2)  # was strcmp');
  out = out.replace(/sprintf\s*\(\w+,\s*"(.*?)"\s*(?:,\s*(.*?))?\s*\)/g, 'f"$1"  # was sprintf');

  // Variable declarations: remove types
  out = out.replace(/^(\s*)(int|float|double|char|long|short|unsigned|bool|size_t|string)\s+(\w+)\s*=\s*/gm, '$1$3 = ');
  out = out.replace(/^(\s*)(int|float|double|char|long|short|unsigned|bool|size_t)\s+(\w+)\s*;/gm, '$1$3 = 0  # declared');

  // Array declarations: int arr[n] → arr = [0] * n
  out = out.replace(/^(\s*)(int|float|double|char)\s+(\w+)\s*\[(\d+)\]\s*;/gm, '$1$3 = [0] * $4  # was $2[$4]');
  out = out.replace(/^(\s*)(int|float|double|char)\s+(\w+)\s*\[(\w+)\]\s*;/gm, '$1$3 = [0] * $4  # was $2[$4]');

  // i++/i-- → i += 1 / i -= 1
  out = out.replace(/\b(\w+)\+\+/g, '$1 += 1');
  out = out.replace(/\b(\w+)--/g, '$1 -= 1');

  // return type strip in leftover lines
  out = out.replace(/^\s*return\s+(.+);/gm, (m, v) => `    return ${v}`);

  // Remove semicolons
  out = out.replace(/;$/gm, '');
  // Remove leftover { }
  out = convertBracesToIndent(out);

  // main function
  out = out.replace(/def main\(\s*\):/g, 'def main():');
  if (/def main/.test(out)) out += '\n\nif __name__ == "__main__":\n    main()';

  notes.push('• <code>#include</code> headers mapped to Python imports where possible');
  notes.push('• <code>printf()</code> → <code>print(f"...")</code> with format substitution');
  notes.push('• C type declarations removed; variables inferred as Python');
  notes.push('• <code>malloc/free</code> → Python lists (no manual memory management needed)');
  notes.push('• <code>for(int i=0;i&lt;n;i++)</code> → <code>for i in range(n)</code>');
  notes.push('• <strong>Manual review needed:</strong> Pointers, structs, unions, bitwise ops, file I/O, and complex macros require manual rewrite');
  return { code: out, notes };
}

// ── C → JAVASCRIPT ────────────────────────────
function cToJavaScript(code) {
  const notes = [];
  let out = code;

  out = out.replace(/#include\s*[<"](\S+?)[>"]/g, (_, h) => {
    const map = {'stdio.h':'// (stdio not needed in JS)', 'math.h':'// Math object available natively',
                 'stdlib.h':'// (stdlib not needed in JS)', 'string.h':'// (string.h not needed in JS)'};
    return map[h] || `// #include <${h}>`;
  });
  out = out.replace(/#define\s+(\w+)\s+(.+)/g, 'const $1 = $2; // was #define');
  out = out.replace(/^#\w+.*$/gm, '');

  // Function defs
  out = out.replace(/^([\w\s\*]+?)\s+(\w+)\s*\(([^)]*)\)\s*\{/gm, (match, ret, name, params) => {
    if (/^(if|else|for|while|switch|do)$/.test(name.trim())) return match;
    const jsParams = params.split(',').map(p => {
      p = p.trim(); if (!p || p === 'void') return '';
      const parts = p.replace(/\s*\*\s*/g, '* ').trim().split(/\s+/);
      return parts[parts.length - 1].replace(/[*&]/g,'') || '';
    }).filter(Boolean).join(', ');
    return `function ${toCamel(name)}(${jsParams}) {`;
  });

  // printf → console.log
  out = out.replace(/printf\s*\(\s*"(.*?)"\s*(?:,\s*(.*?))?\s*\)/g, (_, fmt, args) => {
    if (!args) { const s = fmt.replace(/\\n/g,'').replace(/%[sdicfu]/g,'%s'); return `console.log("${s}")`; }
    const argList = args.split(',').map(a=>a.trim());
    let i = 0;
    const jsFmt = fmt.replace(/\\n/g,'').replace(/%[-\d]*[sdifcu]/g, () => `\${${argList[i++]||''}}`);
    return 'console.log(`' + jsFmt + '`)';
  });
  out = out.replace(/scanf\s*\([^)]*\)/g, '// prompt()  // was scanf');

  out = out.replace(/\bNULL\b/g, 'null');
  out = out.replace(/\btrue\b/g, 'true');
  out = out.replace(/\bfalse\b/g, 'false');

  out = out.replace(/\((int|float|double|char)\)\s*(\w+)/g, 'Number($2)');
  out = out.replace(/pow\s*\(([^,]+),\s*([^)]+)\)/g, 'Math.pow($1, $2)');
  out = out.replace(/sqrt\s*\(/g, 'Math.sqrt(');
  out = out.replace(/\babs\s*\(/g, 'Math.abs(');
  out = out.replace(/fabs\s*\(/g, 'Math.abs(');

  out = out.replace(/strlen\s*\((\w+)\)/g, '$1.length');
  out = out.replace(/strcpy\s*\((\w+),\s*(\w+)\)/g, '$1 = $2  // was strcpy');
  out = out.replace(/strcat\s*\((\w+),\s*(\w+)\)/g, '$1 += $2  // was strcat');
  out = out.replace(/strcmp\s*\((\w+),\s*(\w+)\)/g, '($1 === $2 ? 0 : 1)  // was strcmp');
  out = out.replace(/sprintf\s*\(\w+,\s*"(.*?)"\s*(?:,\s*(.*?))?\s*\)/g, '`$1`  // was sprintf');

  // for loops
  out = out.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*([\w]+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\s*\+\+\s*\)/g, 'for (let $1 = $2; $1 < $3; $1++)');
  out = out.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*([\w]+)\s*;\s*\1\s*<=\s*(\w+)\s*;\s*\1\s*\+\+\s*\)/g, 'for (let $1 = $2; $1 <= $3; $1++)');
  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while ($1) {');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if ($1) {');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, '} else if ($1) {');
  out = out.replace(/\}\s*else\s*\{/g, '} else {');
  out = out.replace(/switch\s*\((\w+)\)\s*\{/g, 'switch ($1) {');
  out = out.replace(/case\s+([\w"']+)\s*:/g, 'case $1:');

  // Type declarations → let/const
  out = out.replace(/^(\s*)(const\s+)?(int|float|double|char|long|short|unsigned|bool|size_t|string)\s+(\w+)\s*=\s*/gm, '$1let $4 = ');
  out = out.replace(/^(\s*)(int|float|double|char|long|short|unsigned|bool|size_t)\s+(\w+)\s*;/gm, '$1let $3;');

  // Array declarations: int arr[n] → let arr = new Array(n).fill(0)
  out = out.replace(/^(\s*)(int|float|double|char)\s+(\w+)\s*\[(\d+)\]\s*;/gm, '$1let $3 = new Array($4).fill(0); // was $2[$4]');
  out = out.replace(/^(\s*)(int|float|double|char)\s+(\w+)\s*\[(\w+)\]\s*;/gm, '$1let $3 = new Array($4).fill(0); // was $2[$4]');

  out = out.replace(/\b(\w+)\+\+/g, '$1++');
  out = out.replace(/\b(\w+)--/g, '$1--');
  // Semicolons already present in C, keep them
  // main → wrappable
  out = out.replace(/function main\s*\(\s*\)\s*\{/, 'function main() {');

  notes.push('• <code>#include</code> removed; JS equivalents noted in comments');
  notes.push('• <code>printf()</code> → <code>console.log()</code> with template literals');
  notes.push('• Type declarations converted to <code>let</code>');
  notes.push('• C arrays → <code>new Array(n).fill(0)</code>');
  notes.push('• <strong>Manual review needed:</strong> Pointers, structs, manual memory, file I/O, bitwise operations');
  return { code: out, notes };
}

// ── C → JAVA ──────────────────────────────────
function cToJava(code) {
  const notes = [];
  let out = code;

  out = out.replace(/#include\s*[<"](\S+?)[>"]/g, (_, h) => {
    const map = {'stdio.h':'import java.util.Scanner;', 'math.h':'import java.lang.Math;',
                 'stdlib.h':'// (stdlib not needed)', 'string.h':'// (String is built-in)'};
    return map[h] || `// #include <${h}>`;
  });
  out = out.replace(/#define\s+(\w+)\s+(.+)/g, 'static final int $1 = $2; // was #define');
  out = out.replace(/^#\w+.*$/gm, '');

  // Function defs
  out = out.replace(/^([\w\s\*]+?)\s+(\w+)\s*\(([^)]*)\)\s*\{/gm, (match, ret, name, params) => {
    if (/^(if|else|for|while|switch|do)$/.test(name.trim())) return match;
    const retJava = cTypeToJava(ret);
    const javaParams = params.split(',').map(p => {
      p = p.trim(); if (!p || p === 'void') return '';
      const parts = p.replace(/\s*\*\s*/g, ' ').trim().split(/\s+/);
      const pname = parts[parts.length - 1].replace(/[*&]/g,'');
      const ptype = cTypeToJava(parts.slice(0,-1).join(' '));
      return pname ? `${ptype} ${pname}` : '';
    }).filter(Boolean).join(', ');
    return `public static ${retJava} ${toCamel(name)}(${javaParams}) {`;
  });

  out = out.replace(/printf\s*\(\s*"(.*?)"\s*(?:,\s*(.*?))?\s*\)/g, (_, fmt, args) => {
    if (!args) return `System.out.println("${fmt.replace(/\\n/g,'').replace(/%[sdicfu]/g,'%s')}")`;
    return `System.out.printf("${fmt}", ${args})`;
  });
  out = out.replace(/scanf\s*\([^)]*\)/g, '/* scanner.next() */  // was scanf');

  out = out.replace(/\bNULL\b/g, 'null');
  out = out.replace(/\btrue\b/g, 'true');
  out = out.replace(/\bfalse\b/g, 'false');

  out = out.replace(/pow\s*\(([^,]+),\s*([^)]+)\)/g, 'Math.pow($1, $2)');
  out = out.replace(/sqrt\s*\(/g, 'Math.sqrt(');
  out = out.replace(/\babs\s*\(/g, 'Math.abs(');
  out = out.replace(/fabs\s*\(/g, 'Math.abs(');
  out = out.replace(/strlen\s*\((\w+)\)/g, '$1.length()');
  out = out.replace(/strcmp\s*\((\w+),\s*(\w+)\)/g, '$1.equals($2) ? 0 : 1');

  // for loops
  out = out.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*([\w]+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\s*\+\+\s*\)/g, 'for (int $1 = $2; $1 < $3; $1++)');
  out = out.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*([\w]+)\s*;\s*\1\s*<=\s*(\w+)\s*;\s*\1\s*\+\+\s*\)/g, 'for (int $1 = $2; $1 <= $3; $1++)');
  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while ($1) {');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if ($1) {');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, '} else if ($1) {');
  out = out.replace(/\}\s*else\s*\{/g, '} else {');
  out = out.replace(/switch\s*\((\w+)\)\s*\{/g, 'switch ($1) {');

  // type declarations: keep Java types, convert C types
  out = out.replace(/^(\s*)(int|float|double|long|short|bool|char)\s+(\w+)\s*=\s*/gm, (m, ind, t, name) => {
    const jt = cTypeToJava(t); return `${ind}${jt} ${name} = `;
  });
  out = out.replace(/^(\s*)(int|float|double|long|short|bool|char)\s+(\w+)\s*;/gm, (m, ind, t, name) => {
    const jt = cTypeToJava(t); return `${ind}${jt} ${name};`;
  });
  // Arrays
  out = out.replace(/^(\s*)(int|float|double|char)\s+(\w+)\s*\[(\d+)\]\s*;/gm, (m, ind, t, name, sz) => {
    const jt = cTypeToJava(t); return `${ind}${jt}[] ${name} = new ${jt}[${sz}];`;
  });

  // Wrap in class
  const hasMain = /public static (void|int) main/.test(out) || /int main/.test(out);
  out = out.replace(/^(\s*)(int|void)\s+main\s*\([^)]*\)\s*\{/gm, '    public static void main(String[] args) {');
  out = `public class Main {\n${out.split('\n').map(l => '    ' + l).join('\n')}\n}`;

  notes.push('• <code>#include</code> → Java <code>import</code> statements');
  notes.push('• C types mapped to Java types (<code>int→int</code>, <code>double→double</code>, <code>char*→String</code>)');
  notes.push('• <code>printf()</code> → <code>System.out.printf()</code>');
  notes.push('• C arrays → Java arrays (<code>int arr[n]</code> → <code>int[] arr = new int[n]</code>)');
  notes.push('• Code wrapped in <code>public class Main</code>');
  notes.push('• <strong>Manual review needed:</strong> Pointers, structs, unions, manual memory, typedef');
  return { code: out, notes };
}

// ── C++ → PYTHON ──────────────────────────────
function cppToPython(code) {
  const notes = [];
  let out = code;

  // Handle C++ specific headers
  out = out.replace(/#include\s*<iostream>/g, '# import sys  # was iostream');
  out = out.replace(/#include\s*<string>/g, '# string is built-in in Python');
  out = out.replace(/#include\s*<vector>/g, '# list replaces vector in Python');
  out = out.replace(/#include\s*<map>/g, '# dict replaces map in Python');
  out = out.replace(/#include\s*<set>/g, '# set is built-in in Python');
  out = out.replace(/#include\s*<algorithm>/g, 'import functools  # was algorithm');
  out = out.replace(/#include\s*<cmath>/g, 'import math  # was cmath');
  out = out.replace(/#include\s*[<"](\S+?)[>"]/g, '# include <$1>');
  out = out.replace(/#define\s+(\w+)\s+(.+)/g, '$1 = $2  # was #define');
  out = out.replace(/^#\w+.*$/gm, '');

  // using namespace std
  out = out.replace(/using\s+namespace\s+\w+\s*;/g, '');

  // cout / cin
  out = out.replace(/std::cout\s*<<\s*(.*?)\s*(?:<<\s*std::endl|<<\s*"\\n")?\s*;/g, (_, val) => `print(${val.replace(/<<\s*/g, ', ')})`);
  out = out.replace(/cout\s*<<\s*(.*?)\s*(?:<<\s*endl|<<\s*"\\n")?\s*;/g, (_, val) => `print(${val.replace(/<<\s*/g, ', ')})`);
  out = out.replace(/std::cin\s*>>\s*(\w+)\s*;/g, '$1 = input()  # was cin >> $1');
  out = out.replace(/cin\s*>>\s*(\w+)\s*;/g, '$1 = input()  # was cin >> $1');

  // vector<T> → list
  out = out.replace(/std::vector\s*<\s*\w+\s*>\s+(\w+)\s*;/g, '$1 = []  # was vector');
  out = out.replace(/vector\s*<\s*\w+\s*>\s+(\w+)\s*;/g, '$1 = []  # was vector');
  out = out.replace(/std::vector\s*<\s*\w+\s*>\s+(\w+)\s*\(\s*(\d+)\s*\)/g, '$1 = [0] * $2  # was vector');
  out = out.replace(/vector\s*<\s*\w+\s*>\s+(\w+)\s*\(\s*(\d+)\s*\)/g, '$1 = [0] * $2  # was vector');

  // map<K,V> → dict
  out = out.replace(/(?:std::)?map\s*<[^>]+>\s+(\w+)\s*;/g, '$1 = {}  # was map');

  // string → str (declarations)
  out = out.replace(/(?:std::)?string\s+(\w+)\s*=\s*"(.*?)"\s*;/g, '$1 = "$2"');
  out = out.replace(/(?:std::)?string\s+(\w+)\s*;/g, '$1 = ""  # was string');

  // .push_back() → .append()
  out = out.replace(/\.push_back\s*\(/g, '.append(');
  // .size() → len()
  out = out.replace(/(\w+)\.size\s*\(\s*\)/g, 'len($1)');
  // .empty() → not
  out = out.replace(/(\w+)\.empty\s*\(\s*\)/g, 'not $1');
  // .find() → in
  out = out.replace(/(\w+)\.find\s*\((\w+)\)\s*!=\s*(?:std::)?string::npos/g, '$2 in $1');
  // .substr() → slicing
  out = out.replace(/(\w+)\.substr\s*\((\d+),\s*(\d+)\)/g, '$1[$2:$2+$3]');

  // Class definitions
  out = out.replace(/class\s+(\w+)(?:\s*:\s*(?:public|private|protected)\s+(\w+))?\s*\{/g, (_, name, parent) =>
    parent ? `class ${name}(${parent}):` : `class ${name}:`);
  out = out.replace(/public\s*:/g, '# public:');
  out = out.replace(/private\s*:/g, '# private:');
  out = out.replace(/protected\s*:/g, '# protected:');

  // Constructor: ClassName() → def __init__(self)
  out = out.replace(/(\w+)\s*::\s*(\w+)\s*\(([^)]*)\)\s*\{/g, (_, cls, name, params) => {
    const pyParams = params.split(',').map(p => { p=p.trim(); const parts=p.split(/\s+/); return parts[parts.length-1].replace(/[*&]/g,''); }).filter(Boolean);
    if (cls === name) return `def __init__(self${pyParams.length ? ', '+pyParams.join(', ') : ''}):`;
    return `def ${toSnake(name)}(self${pyParams.length ? ', '+pyParams.join(', ') : ''}):`;
  });

  // Method defs inside class
  out = out.replace(/^([\w\s\*]+?)\s+(\w+)\s*\(([^)]*)\)\s*\{/gm, (match, ret, name, params) => {
    if (/^(if|else|for|while|switch|do|class)$/.test(name.trim())) return match;
    const pyParams = params.split(',').map(p => {
      p = p.trim(); if (!p || p === 'void') return '';
      const parts = p.replace(/\s*\*\s*/g,'* ').trim().split(/\s+/);
      return parts[parts.length-1].replace(/[*&]/g,'') || '';
    }).filter(Boolean);
    return `def ${toSnake(name)}(${pyParams.join(', ')}):`;
  });

  // nullptr → None
  out = out.replace(/\bnullptr\b/g, 'None');
  out = out.replace(/\bNULL\b/g, 'None');
  out = out.replace(/\btrue\b/g, 'True');
  out = out.replace(/\bfalse\b/g, 'False');
  out = out.replace(/\bthis->/g, 'self.');

  // new / delete
  out = out.replace(/new\s+(\w+)\s*\(([^)]*)\)/g, '$1($2)  # was new');
  out = out.replace(/delete\s+(\w+)\s*;/g, '# del $1  # was delete');

  // Type casts
  out = out.replace(/static_cast\s*<([^>]+)>\s*\(([^)]+)\)/g, (_, t, v) => {
    const pyMap = {int:'int', float:'float', double:'float', 'std::string':'str', string:'str', char:'chr'};
    return `${pyMap[t.trim()]||t.trim()}(${v})`;
  });
  out = out.replace(/dynamic_cast\s*<[^>]+>\s*\(([^)]+)\)/g, '$1  # was dynamic_cast');

  // printf → print
  out = out.replace(/printf\s*\(\s*"(.*?)"\s*(?:,\s*(.*?))?\s*\)/g, (_, fmt, args) => {
    if (!args) return `print("${fmt.replace(/\\n/g,'')}")`;
    const argList = args.split(',').map(a=>a.trim());
    let i = 0;
    const pyFmt = fmt.replace(/\\n/g,'').replace(/%[-\d]*[sdifcu]/g, () => `{${argList[i++]||''}}`);
    return `print(f"${pyFmt}")`;
  });

  // for loops
  out = out.replace(/for\s*\(\s*(?:int|auto)\s+(\w+)\s*=\s*([\w]+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\s*\+\+\s*\)/g, 'for $1 in range($2, $3):');
  out = out.replace(/for\s*\(\s*(?:int|auto)\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\s*\+\+\s*\)/g, 'for $1 in range($2):');
  // range-based for
  out = out.replace(/for\s*\(\s*(?:auto|const auto)&?\s+(\w+)\s*:\s*(\w+)\s*\)\s*\{/g, 'for $1 in $2:');

  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while $1:');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if $1:');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, 'elif $1:');
  out = out.replace(/\}\s*else\s*\{/g, 'else:');

  out = out.replace(/pow\s*\(([^,]+),\s*([^)]+)\)/g, '($1 ** $2)');
  out = out.replace(/std::sqrt\s*\(/g, 'math.sqrt('); out = out.replace(/sqrt\s*\(/g, 'math.sqrt(');
  out = out.replace(/std::abs\s*\(/g, 'abs('); out = out.replace(/\babs\s*\(/g, 'abs(');

  // Variable declarations: remove types
  out = out.replace(/^(\s*)(const\s+)?(int|float|double|long|short|char|bool|auto)\s+(\w+)\s*=\s*/gm, '$1$4 = ');
  out = out.replace(/^(\s*)(int|float|double|long|short|char|bool)\s+(\w+)\s*;/gm, '$1$3 = 0  # declared');

  out = out.replace(/\b(\w+)\+\+/g, '$1 += 1');
  out = out.replace(/\b(\w+)--/g, '$1 -= 1');
  out = out.replace(/;$/gm, '');
  out = convertBracesToIndent(out);

  if (/def main/.test(out)) out += '\n\nif __name__ == "__main__":\n    main()';

  notes.push('• <code>cout/cin</code> → <code>print()/input()</code>');
  notes.push('• <code>vector&lt;T&gt;</code> → Python <code>list</code>; <code>map&lt;K,V&gt;</code> → <code>dict</code>');
  notes.push('• <code>std::string</code> → Python <code>str</code>');
  notes.push('• <code>class</code> syntax converted; <code>this-&gt;</code> → <code>self.</code>');
  notes.push('• <code>new/delete</code> → constructor calls / no manual memory needed');
  notes.push('• <strong>Manual review needed:</strong> Templates, operator overloading, RAII, multiple inheritance, smart pointers');
  return { code: out, notes };
}

// ── C++ → JAVASCRIPT ──────────────────────────
function cppToJavaScript(code) {
  const notes = [];
  let out = code;

  out = out.replace(/#include\s*<iostream>/g, '// (use console.log instead of cout)');
  out = out.replace(/#include\s*<string>/g, '// (string is native in JS)');
  out = out.replace(/#include\s*<vector>/g, '// (use Array instead of vector)');
  out = out.replace(/#include\s*<map>/g, '// (use Map or {} instead of map)');
  out = out.replace(/#include\s*<set>/g, '// (use Set instead of set)');
  out = out.replace(/#include\s*<algorithm>/g, '// (use Array methods)');
  out = out.replace(/#include\s*<cmath>/g, '// (use Math object)');
  out = out.replace(/#include\s*[<"](\S+?)[>"]/g, '// #include <$1>');
  out = out.replace(/#define\s+(\w+)\s+(.+)/g, 'const $1 = $2; // was #define');
  out = out.replace(/^#\w+.*$/gm, '');
  out = out.replace(/using\s+namespace\s+\w+\s*;/g, '');

  // cout/cin
  out = out.replace(/(?:std::)?cout\s*<<\s*(.*?)\s*(?:<<\s*(?:std::)?endl|<<\s*"\\n")?\s*;/g, (_, val) => {
    const parts = val.split('<<').map(s => s.trim()).filter(Boolean);
    return `console.log(${parts.join(', ')});`;
  });
  out = out.replace(/(?:std::)?cin\s*>>\s*(\w+)\s*;/g, 'let $1 = prompt(); // was cin >> $1');

  // vector → Array
  out = out.replace(/(?:std::)?vector\s*<\s*\w+\s*>\s+(\w+)\s*;/g, 'let $1 = []; // was vector');
  out = out.replace(/(?:std::)?vector\s*<\s*\w+\s*>\s+(\w+)\s*\(\s*(\d+)\s*\)/g, 'let $1 = new Array($2).fill(0); // was vector');
  out = out.replace(/\.push_back\s*\(/g, '.push(');
  out = out.replace(/(\w+)\.size\s*\(\s*\)/g, '$1.length');
  out = out.replace(/(\w+)\.empty\s*\(\s*\)/g, '$1.length === 0');
  out = out.replace(/(\w+)\.at\s*\((\w+)\)/g, '$1[$2]');

  // map → Map
  out = out.replace(/(?:std::)?map\s*<[^>]+>\s+(\w+)\s*;/g, 'const $1 = new Map(); // was map');

  // string
  out = out.replace(/(?:std::)?string\s+(\w+)\s*=\s*"(.*?)"\s*;/g, 'let $1 = "$2";');
  out = out.replace(/(?:std::)?string\s+(\w+)\s*;/g, 'let $1 = ""; // was string');
  out = out.replace(/\.length\s*\(\s*\)/g, '.length');
  out = out.replace(/\.substr\s*\((\d+),\s*(\d+)\)/g, '.slice($1, $1+$2)');
  out = out.replace(/\.find\s*\((\w+)\)\s*!=\s*(?:std::)?string::npos/g, '.includes($1)');

  // Class
  out = out.replace(/class\s+(\w+)(?:\s*:\s*(?:public|private|protected)\s+(\w+))?\s*\{/g, (_, name, parent) =>
    parent ? `class ${name} extends ${parent} {` : `class ${name} {`);
  out = out.replace(/public\s*:/g, '// public:');
  out = out.replace(/private\s*:/g, '// private:');
  out = out.replace(/protected\s*:/g, '// protected:');

  // Constructor
  out = out.replace(/(\w+)\s*::\s*(\w+)\s*\(([^)]*)\)\s*\{/g, (_, cls, name, params) => {
    const jsParams = params.split(',').map(p => {
      p=p.trim(); const parts=p.split(/\s+/); return parts[parts.length-1].replace(/[*&]/g,'');
    }).filter(Boolean).join(', ');
    if (cls === name) return `constructor(${jsParams}) {`;
    return `${toCamel(name)}(${jsParams}) {`;
  });

  // Method defs
  out = out.replace(/^([\w\s\*&:<>]+?)\s+(\w+)\s*\(([^)]*)\)\s*\{/gm, (match, ret, name, params) => {
    if (/^(if|else|for|while|switch|do|class|constructor)$/.test(name.trim())) return match;
    const jsParams = params.split(',').map(p => {
      p=p.trim(); if (!p||p==='void') return '';
      const parts=p.replace(/\s*\*\s*/g,'* ').trim().split(/\s+/);
      return parts[parts.length-1].replace(/[*&]/g,'') || '';
    }).filter(Boolean).join(', ');
    return `${toCamel(name)}(${jsParams}) {`;
  });

  // nullptr → null
  out = out.replace(/\bnullptr\b/g, 'null'); out = out.replace(/\bNULL\b/g, 'null');
  out = out.replace(/\btrue\b/g, 'true'); out = out.replace(/\bfalse\b/g, 'false');
  out = out.replace(/\bthis->/g, 'this.');

  // new/delete
  out = out.replace(/new\s+(\w+)\s*\(([^)]*)\)/g, 'new $1($2)');
  out = out.replace(/delete\s+(\w+)\s*;/g, '// delete $1 (not needed in JS)');

  // Casts
  out = out.replace(/static_cast\s*<([^>]+)>\s*\(([^)]+)\)/g, 'Number($2) // was static_cast');
  out = out.replace(/dynamic_cast\s*<[^>]+>\s*\(([^)]+)\)/g, '$1 // was dynamic_cast');

  // printf → console.log
  out = out.replace(/printf\s*\(\s*"(.*?)"\s*(?:,\s*(.*?))?\s*\)/g, (_, fmt, args) => {
    if (!args) return `console.log("${fmt.replace(/\\n/g,'')}")`;
    const argList = args.split(',').map(a=>a.trim());
    let i = 0;
    const jsFmt = fmt.replace(/\\n/g,'').replace(/%[-\d]*[sdifcu]/g, () => `\${${argList[i++]||''}}`);
    return 'console.log(`' + jsFmt + '`)';
  });

  // for loops
  out = out.replace(/for\s*\(\s*(?:int|auto)\s+(\w+)\s*=\s*([\w]+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\s*\+\+\s*\)/g, 'for (let $1 = $2; $1 < $3; $1++)');
  out = out.replace(/for\s*\(\s*(?:int|auto)\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\s*\+\+\s*\)/g, 'for (let $1 = 0; $1 < $2; $1++)');
  // range-based for
  out = out.replace(/for\s*\(\s*(?:auto|const auto)&?\s+(\w+)\s*:\s*(\w+)\s*\)\s*\{/g, 'for (const $1 of $2) {');

  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while ($1) {');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if ($1) {');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, '} else if ($1) {');
  out = out.replace(/\}\s*else\s*\{/g, '} else {');

  out = out.replace(/Math::pow|std::pow|pow\s*\(([^,]+),\s*([^)]+)\)/g, 'Math.pow($1, $2)');
  out = out.replace(/(?:std::)?sqrt\s*\(/g, 'Math.sqrt(');
  out = out.replace(/(?:std::)?abs\s*\(/g, 'Math.abs(');

  // type declarations → let/const
  out = out.replace(/^(\s*)(const\s+)?(int|float|double|long|short|char|bool|auto)\s+(\w+)\s*=\s*/gm, '$1$2let $4 = ');
  out = out.replace(/^(\s*)(int|float|double|long|short|char|bool)\s+(\w+)\s*;/gm, '$1let $3;');
  out = out.replace(/^(\s*)(int|float|double|char)\s+(\w+)\s*\[(\w+)\]\s*;/gm, '$1let $3 = new Array($4).fill(0);');

  out = out.replace(/\b(\w+)\+\+/g, '$1++');
  out = out.replace(/\b(\w+)--/g, '$1--');
  // Wrap standalone functions in nothing — keep brace structure
  notes.push('• <code>cout/cin</code> → <code>console.log()/prompt()</code>');
  notes.push('• <code>vector&lt;T&gt;</code> → JS <code>Array</code>; <code>map&lt;K,V&gt;</code> → <code>Map</code>');
  notes.push('• <code>class</code> converted to JS class with <code>constructor</code>');
  notes.push('• <code>this-&gt;</code> → <code>this.</code>; range-based for → <code>for...of</code>');
  notes.push('• <strong>Manual review needed:</strong> Templates, operator overloading, multiple inheritance, RAII, smart pointers');
  return { code: out, notes };
}

// ── C++ → JAVA ────────────────────────────────
function cppToJava(code) {
  const notes = [];
  let out = code;

  out = out.replace(/#include\s*<iostream>/g, 'import java.util.Scanner;');
  out = out.replace(/#include\s*<string>/g, '// (String is built-in)');
  out = out.replace(/#include\s*<vector>/g, 'import java.util.ArrayList;');
  out = out.replace(/#include\s*<map>/g, 'import java.util.HashMap;');
  out = out.replace(/#include\s*<set>/g, 'import java.util.HashSet;');
  out = out.replace(/#include\s*<algorithm>/g, 'import java.util.Collections;');
  out = out.replace(/#include\s*<cmath>/g, '// (use Math class)');
  out = out.replace(/#include\s*[<"](\S+?)[>"]/g, '// #include <$1>');
  out = out.replace(/#define\s+(\w+)\s+(.+)/g, 'static final int $1 = $2; // was #define');
  out = out.replace(/^#\w+.*$/gm, '');
  out = out.replace(/using\s+namespace\s+\w+\s*;/g, '');

  // cout/cin
  out = out.replace(/(?:std::)?cout\s*<<\s*(.*?)\s*(?:<<\s*(?:std::)?endl|<<\s*"\\n")?\s*;/g, (_, val) => {
    const parts = val.split('<<').map(s => s.trim()).filter(Boolean);
    return `System.out.println(${parts.join(' + ')});`;
  });
  out = out.replace(/(?:std::)?cin\s*>>\s*(\w+)\s*;/g, '$1 = scanner.nextLine(); // was cin >> $1');

  // vector → ArrayList
  out = out.replace(/(?:std::)?vector\s*<\s*(\w+)\s*>\s+(\w+)\s*;/g, (_, t, name) => {
    const jt = cTypeToJava(t)||t; return `ArrayList<${jt}> ${name} = new ArrayList<>();`;
  });
  out = out.replace(/\.push_back\s*\(/g, '.add(');
  out = out.replace(/(\w+)\.size\s*\(\s*\)/g, '$1.size()');
  out = out.replace(/(\w+)\.empty\s*\(\s*\)/g, '$1.isEmpty()');

  // map → HashMap
  out = out.replace(/(?:std::)?map\s*<([^>]+)>\s+(\w+)\s*;/g, 'HashMap<Object,Object> $2 = new HashMap<>();');

  // string
  out = out.replace(/(?:std::)?string\s+(\w+)\s*=\s*"(.*?)"\s*;/g, 'String $1 = "$2";');
  out = out.replace(/(?:std::)?string\s+(\w+)\s*;/g, 'String $1 = "";');
  out = out.replace(/\.substr\s*\((\d+),\s*(\d+)\)/g, '.substring($1, $1+$2)');
  out = out.replace(/\.find\s*\((\w+)\)\s*!=\s*(?:std::)?string::npos/g, '.contains($1)');
  out = out.replace(/(\w+)\.length\s*\(\s*\)/g, '$1.length()');

  // Class: C++ → Java (remove access specifiers inside)
  out = out.replace(/class\s+(\w+)(?:\s*:\s*(?:public|private|protected)\s+(\w+))?\s*\{/g, (_, name, parent) =>
    parent ? `public class ${name} extends ${parent} {` : `public class ${name} {`);
  out = out.replace(/^(\s*)public\s*:/gm, '$1// public:');
  out = out.replace(/^(\s*)private\s*:/gm, '$1// private:');
  out = out.replace(/^(\s*)protected\s*:/gm, '$1// protected:');

  // Constructor
  out = out.replace(/(\w+)\s*::\s*\1\s*\(([^)]*)\)\s*\{/g, (_, cls, params) => {
    const javaParams = params.split(',').map(p => {
      p=p.trim(); if(!p||p==='void') return '';
      const parts=p.replace(/\s*\*\s*/g,' ').trim().split(/\s+/);
      const pname=parts[parts.length-1].replace(/[*&]/g,'');
      const ptype=cTypeToJava(parts.slice(0,-1).join(' '))||'Object';
      return pname ? `${ptype} ${pname}` : '';
    }).filter(Boolean).join(', ');
    return `public ${cls}(${javaParams}) {`;
  });

  // Method defs (ClassName::methodName)
  out = out.replace(/(\w+)\s*::\s*(\w+)\s*\(([^)]*)\)\s*\{/g, (_, cls, name, params) => {
    const javaParams = params.split(',').map(p => {
      p=p.trim(); if(!p||p==='void') return '';
      const parts=p.replace(/\s*\*\s*/g,' ').trim().split(/\s+/);
      const pname=parts[parts.length-1].replace(/[*&]/g,'');
      const ptype=cTypeToJava(parts.slice(0,-1).join(' '))||'Object';
      return pname ? `${ptype} ${pname}` : '';
    }).filter(Boolean).join(', ');
    return `public Object ${toCamel(name)}(${javaParams}) {`;
  });

  // Remaining function defs
  out = out.replace(/^([\w\s\*&:<>]+?)\s+(\w+)\s*\(([^)]*)\)\s*\{/gm, (match, ret, name, params) => {
    if (/^(if|else|for|while|switch|do|class|public|private)$/.test(name.trim())) return match;
    const retJava = cTypeToJava(ret)||'void';
    const javaParams = params.split(',').map(p => {
      p=p.trim(); if(!p||p==='void') return '';
      const parts=p.replace(/\s*\*\s*/g,' ').trim().split(/\s+/);
      const pname=parts[parts.length-1].replace(/[*&]/g,'');
      const ptype=cTypeToJava(parts.slice(0,-1).join(' '))||'Object';
      return pname ? `${ptype} ${pname}` : '';
    }).filter(Boolean).join(', ');
    return `public static ${retJava} ${toCamel(name)}(${javaParams}) {`;
  });

  out = out.replace(/\bnullptr\b/g, 'null'); out = out.replace(/\bNULL\b/g, 'null');
  out = out.replace(/\btrue\b/g, 'true'); out = out.replace(/\bfalse\b/g, 'false');
  out = out.replace(/\bthis->/g, 'this.');

  // new stays as new; delete → no-op comment
  out = out.replace(/delete\s+(\w+)\s*;/g, '// delete $1 (not needed in Java)');

  // Casts
  out = out.replace(/static_cast\s*<([^>]+)>\s*\(([^)]+)\)/g, (_, t, v) => `(${cTypeToJava(t)}) ${v}`);

  out = out.replace(/for\s*\(\s*(?:int|auto)\s+(\w+)\s*=\s*([\w]+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\s*\+\+\s*\)/g, 'for (int $1 = $2; $1 < $3; $1++)');
  out = out.replace(/for\s*\(\s*(?:int|auto)\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\s*\+\+\s*\)/g, 'for (int $1 = 0; $1 < $2; $1++)');
  out = out.replace(/for\s*\(\s*(?:auto|const auto)&?\s+(\w+)\s*:\s*(\w+)\s*\)\s*\{/g, 'for (var $1 : $2) {');
  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while ($1) {');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if ($1) {');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, '} else if ($1) {');
  out = out.replace(/\}\s*else\s*\{/g, '} else {');

  out = out.replace(/(?:std::)?pow\s*\(([^,]+),\s*([^)]+)\)/g, 'Math.pow($1, $2)');
  out = out.replace(/(?:std::)?sqrt\s*\(/g, 'Math.sqrt(');
  out = out.replace(/(?:std::)?abs\s*\(/g, 'Math.abs(');

  // type declarations
  out = out.replace(/^(\s*)(const\s+)?(int|float|double|long|short|bool|char)\s+(\w+)\s*=\s*/gm, (m, ind, cn, t, name) => {
    const jt=cTypeToJava(t); return `${ind}${cn||''}${jt} ${name} = `;
  });
  out = out.replace(/^(\s*)(int|float|double|long|short|bool|char)\s+(\w+)\s*;/gm, (m, ind, t, name) => {
    const jt=cTypeToJava(t); return `${ind}${jt} ${name};`;
  });
  // Arrays
  out = out.replace(/^(\s*)(int|float|double|char)\s+(\w+)\s*\[(\w+)\]\s*;/gm, (m, ind, t, name, sz) => {
    const jt=cTypeToJava(t); return `${ind}${jt}[] ${name} = new ${jt}[${sz}];`;
  });

  // main
  out = out.replace(/^(\s*)(int|void)\s+main\s*\([^)]*\)\s*\{/gm, '    public static void main(String[] args) {');

  notes.push('• <code>cout/cin</code> → <code>System.out.println/scanner</code>');
  notes.push('• <code>vector&lt;T&gt;</code> → <code>ArrayList&lt;T&gt;</code>; <code>map</code> → <code>HashMap</code>');
  notes.push('• C++ class with access specifiers → Java public class');
  notes.push('• <code>this-&gt;</code> → <code>this.</code>; destructors removed');
  notes.push('• <strong>Manual review needed:</strong> Templates→Generics, operator overloading, multiple inheritance, RAII');
  return { code: out, notes };
}

// ── PYTHON → C ────────────────────────────────
function pythonToC(code) {
  const notes = [];
  let out = code;

  // Headers
  out = `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <math.h>\n#include <stdbool.h>\n\n` + out;

  // Docstrings → block comments
  out = out.replace(/"""([\s\S]*?)"""/g, (_, s) => `/* ${s.trim()} */`);
  out = out.replace(/'''([\s\S]*?)'''/g, (_, s) => `/* ${s.trim()} */`);

  // Function defs
  out = out.replace(/^def (\w+)\((.*?)\)(?:\s*->\s*([\w\[\], \.]+))?\s*:/gm, (_, name, params, ret) => {
    const cParams = params.split(',').map(p => {
      p = p.trim().replace(/:\s*[\w\[\]\.]+/g,'').replace(/=.*$/,'').trim();
      return p ? `int ${p}` : '';
    }).filter(Boolean).join(', ') || 'void';
    const cRet = ret ? (ret.trim()==='str'?'char*':ret.trim()==='float'?'double':'int') : 'int';
    return `${cRet} ${name}(${cParams}) {`;
  });

  // Class → struct + comment
  out = out.replace(/^class (\w+)(?:\((\w+)\))?:/gm, (_, name) => `typedef struct _${name} {\n    /* TODO: add fields */\n} ${name}; // was class ${name}`);

  // print → printf
  out = out.replace(/print\s*\(f"(.*?)"\)/g, (_, s) => {
    const fmt = s.replace(/\{(\w+)\}/g, '%d');
    const vars = [...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).join(', ');
    return `printf("${fmt}\\n"${vars ? ', '+vars : ''});`;
  });
  out = out.replace(/print\s*\("(.*?)"\)/g, 'printf("$1\\n");');
  out = out.replace(/print\s*\((\w+)\)/g, 'printf("%d\\n", $1);');
  out = out.replace(/print\s*\((.*?)\)/g, 'printf("%d\\n", $1);');

  // Booleans
  out = out.replace(/\bTrue\b/g, 'true'); out = out.replace(/\bFalse\b/g, 'false'); out = out.replace(/\bNone\b/g, 'NULL');

  // and/or/not
  out = out.replace(/\band\b/g, '&&'); out = out.replace(/\bor\b/g, '||'); out = out.replace(/\bnot\s+/g, '!');

  // len() → strlen() / sizeof
  out = out.replace(/len\((\w+)\)/g, 'strlen($1)');

  // String methods
  out = out.replace(/\.upper\(\)/g, '  /* .upper() — use strupr() */');
  out = out.replace(/\.lower\(\)/g, '  /* .lower() — use strlwr() */');
  out = out.replace(/\.strip\(\)/g, '  /* .strip() — no direct equivalent */');

  // f-strings
  out = out.replace(/f"(.*?)"/g, (_, s) => {
    const fmt = s.replace(/\{(\w+)\}/g,'%d');
    return `"${fmt}"  /* f-string: check format specifier */`;
  });

  // elif → else if
  out = out.replace(/\belif\b/g, 'else if');

  // for range
  out = out.replace(/for (\w+) in range\((\d+)\):/g, 'for (int $1 = 0; $1 < $2; $1++) {');
  out = out.replace(/for (\w+) in range\((\w+),\s*(\w+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
  out = out.replace(/for (\w+) in range\((\w+),\s*(\w+),\s*(-?\d+)\):/g, 'for (int $1 = $2; $1 < $3; $1 += $4) {');
  out = out.replace(/for (\w+) in (\w+):/g, 'for (int i = 0; i < strlen($2); i++) { /* iterate */ int $1 = $2[i];');

  // while / if / else
  out = out.replace(/while (.+?):/g, 'while ($1) {');
  out = out.replace(/if (.+?):/g, 'if ($1) {');
  out = out.replace(/else:/g, '} else {');

  // ** → pow()
  out = out.replace(/(\w+)\s*\*\*\s*(\w+)/g, 'pow($1, $2)');

  // Variable assignments — add int type hint
  out = out.replace(/^(\s*)([a-z_]\w*)\s*=\s*(.+)$/gm, (match, indent, name, val) => {
    if (/^(if|else|while|for|int|float|double|char|return|\/\/)/.test(match.trim())) return match;
    return `${indent}int ${name} = ${val};  /* check type */`;
  });

  // return
  out = out.replace(/^\s*return\s+(.+)$/gm, '    return $1;');

  out = convertIndentToBraces(out);

  // main wrapper
  if (!/int main/.test(out)) {
    const body = out.split('\n').filter(l=>l.trim()).join('\n');
    out = out + '\n\nint main(void) {\n    /* call your functions here */\n    return 0;\n}';
  }

  notes.push('• Standard C headers added (<code>stdio.h, stdlib.h, math.h, stdbool.h</code>)');
  notes.push('• <code>def</code> → C function with <code>int</code> return type (review all types)');
  notes.push('• <code>print()</code> → <code>printf()</code> with format specifiers');
  notes.push('• <code>True/False/None</code> → <code>true/false/NULL</code>');
  notes.push('• Variables declared as <code>int</code> — review and assign correct C types');
  notes.push('• <strong>Manual review needed:</strong> Memory management, pointers, dynamic allocation, string handling, list comprehensions');
  return { code: out, notes };
}

// ── PYTHON → C++ ──────────────────────────────
function pythonToCpp(code) {
  const notes = [];
  let out = code;

  out = `#include <iostream>\n#include <string>\n#include <vector>\n#include <map>\n#include <cmath>\n#include <algorithm>\nusing namespace std;\n\n` + out;

  out = out.replace(/"""([\s\S]*?)"""/g, (_, s) => `/* ${s.trim()} */`);
  out = out.replace(/'''([\s\S]*?)'''/g, (_, s) => `/* ${s.trim()} */`);

  // Function defs
  out = out.replace(/^def (\w+)\((.*?)\)(?:\s*->\s*([\w\[\], \.]+))?\s*:/gm, (_, name, params, ret) => {
    const cppParams = params.split(',').map(p => {
      p = p.trim(); const colonIdx = p.indexOf(':');
      const eqIdx = p.indexOf('=');
      const pname = (colonIdx > -1 ? p.slice(0,colonIdx) : eqIdx > -1 ? p.slice(0,eqIdx) : p).trim();
      const ptype = (colonIdx > -1 ? p.slice(colonIdx+1, eqIdx > -1 ? eqIdx : undefined) : 'int').trim();
      const cppType = {'int':'int','float':'double','str':'string','bool':'bool','list':'vector<int>','dict':'map<string,int>'}[ptype]||'int';
      const defaultVal = eqIdx > -1 ? ` = ${p.slice(eqIdx+1).trim()}` : '';
      return pname ? `${cppType} ${pname}${defaultVal}` : '';
    }).filter(Boolean).join(', ') || '';
    const cppRet = ret ? ({'str':'string','float':'double','bool':'bool','int':'int','None':'void'}[ret.trim()]||'auto') : 'int';
    return `${cppRet} ${name}(${cppParams}) {`;
  });

  // Class → C++ class
  out = out.replace(/^class (\w+)(?:\((\w+)\))?:/gm, (_, name, parent) =>
    parent ? `class ${name} : public ${parent} {` : `class ${name} {`);

  // __init__ → constructor
  out = out.replace(/def __init__\s*\(self(?:,\s*(.*?))?\):/g, (_, params) => {
    const cppParams = params ? params.split(',').map(p => {
      p=p.trim(); const parts=p.split(':'); return `int ${parts[0].trim()}`;
    }).join(', ') : '';
    return `public:\n    /* constructor — add your class name */\n    (${cppParams}) {`;
  });

  // self. → this->
  out = out.replace(/\bself\./g, 'this->');

  // print → cout
  out = out.replace(/print\s*\(f"(.*?)"\)/g, (_, s) => {
    const parts = s.split(/\{(\w+)\}/);
    const coutParts = parts.map((p, i) => i%2===0 ? `"${p}"` : p).join(' << ');
    return `cout << ${coutParts} << endl;`;
  });
  out = out.replace(/print\s*\("(.*?)"\)/g, 'cout << "$1" << endl;');
  out = out.replace(/print\s*\((\w+)\)/g, 'cout << $1 << endl;');
  out = out.replace(/print\s*\((.*?)\)/g, 'cout << $1 << endl;');

  // input() → cin
  out = out.replace(/(\w+)\s*=\s*int\s*\(\s*input\s*\([^)]*\)\s*\)/g, 'int $1;\ncin >> $1;');
  out = out.replace(/(\w+)\s*=\s*input\s*\([^)]*\)/g, 'string $1;\ncin >> $1;');

  out = out.replace(/\bTrue\b/g, 'true'); out = out.replace(/\bFalse\b/g, 'false'); out = out.replace(/\bNone\b/g, 'nullptr');
  out = out.replace(/\band\b/g, '&&'); out = out.replace(/\bor\b/g, '||'); out = out.replace(/\bnot\s+/g, '!');

  // List/dict literals
  out = out.replace(/(\w+)\s*=\s*\[\]/g, 'vector<int> $1;');
  out = out.replace(/(\w+)\s*=\s*\{\}/g, 'map<string, int> $1;');
  out = out.replace(/\.append\s*\(/g, '.push_back(');
  out = out.replace(/len\s*\((\w+)\)/g, '$1.size()');

  // String methods
  out = out.replace(/\.upper\(\)/g, '  /* .upper() — use transform()+toupper */');
  out = out.replace(/\.lower\(\)/g, '  /* .lower() — use transform()+tolower */');
  out = out.replace(/\.strip\(\)/g, '  /* .strip() — no direct equivalent */');

  // elif → else if
  out = out.replace(/\belif\b/g, 'else if');

  // for range
  out = out.replace(/for (\w+) in range\((\d+)\):/g, 'for (int $1 = 0; $1 < $2; $1++) {');
  out = out.replace(/for (\w+) in range\((\w+),\s*(\w+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
  out = out.replace(/for (\w+) in range\((\w+),\s*(\w+),\s*(-?\d+)\):/g, 'for (int $1 = $2; $1 < $3; $1 += $4) {');
  out = out.replace(/for (\w+) in (\w+):/g, 'for (auto& $1 : $2) {');

  out = out.replace(/while (.+?):/g, 'while ($1) {');
  out = out.replace(/if (.+?):/g, 'if ($1) {');
  out = out.replace(/else:/g, '} else {');

  // ** → pow()
  out = out.replace(/(\w+)\s*\*\*\s*(\w+)/g, 'pow($1, $2)');

  // Variable declarations
  out = out.replace(/^(\s*)([a-z_]\w*)\s*=\s*(-?\d+\.\d+)/gm, '$1double $2 = $3;');
  out = out.replace(/^(\s*)([a-z_]\w*)\s*=\s*(-?\d+)/gm, '$1int $2 = $3;');
  out = out.replace(/^(\s*)([a-z_]\w*)\s*=\s*"(.*?)"/gm, '$1string $2 = "$3";');
  out = out.replace(/^(\s*)([a-z_]\w*)\s*=\s*(.+)$/gm, (match, indent, name, val) => {
    if (/^(if|else|while|for|int|double|string|auto|return|\/\/|cout|cin)/.test(match.trim())) return match;
    return `${indent}auto ${name} = ${val};`;
  });

  // return / semicolons
  out = out.replace(/^\s*return\s+(.+)$/gm, '    return $1;');

  out = convertIndentToBraces(out);

  if (!/int main/.test(out) && !/main\s*\(/.test(out)) {
    out += '\n\nint main() {\n    /* call your functions here */\n    return 0;\n}';
  }

  notes.push('• C++ headers added: <code>iostream, string, vector, map, cmath</code>');
  notes.push('• <code>def</code> → C++ function with inferred types; review all return/param types');
  notes.push('• <code>print()</code> → <code>cout &lt;&lt; ... &lt;&lt; endl</code>');
  notes.push('• <code>list</code> → <code>vector&lt;int&gt;</code>; <code>dict</code> → <code>map&lt;string,int&gt;</code>');
  notes.push('• <code>class</code> converted; <code>self.</code> → <code>this-&gt;</code>');
  notes.push('• <strong>Manual review needed:</strong> Memory management, templates, operator overloading, constructors/destructors');
  return { code: out, notes };
}

// ── JAVASCRIPT → C ────────────────────────────
function javascriptToC(code) {
  const notes = [];
  let out = code;

  out = `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n#include <math.h>\n\n` + out;

  // Arrow functions
  out = out.replace(/const (\w+)\s*=\s*\((.*?)\)\s*=>\s*\{/g, 'int $1($2) {');
  out = out.replace(/const (\w+)\s*=\s*(\w+)\s*=>\s*\{/g, 'int $1($2) {');
  // function keyword
  out = out.replace(/function (\w+)\s*\((.*?)\)\s*\{/g, 'int $1($2) {');

  // Remove variable declaration keywords
  out = out.replace(/\b(const|let|var)\s+(\w+)\s*=/g, 'int $2 =  /* check type */');

  // console.log → printf
  out = out.replace(/console\.log\s*\(`(.*?)`\)/g, (_, s) => {
    const fmt = s.replace(/\$\{(\w+)\}/g,'%d');
    const vars = [...s.matchAll(/\$\{(\w+)\}/g)].map(m=>m[1]).join(', ');
    return `printf("${fmt}\\n"${vars?', '+vars:''});`;
  });
  out = out.replace(/console\.log\s*\("(.*?)"\)/g, 'printf("$1\\n");');
  out = out.replace(/console\.log\s*\((\w+)\)/g, 'printf("%d\\n", $1);');
  out = out.replace(/console\.log\s*\((.*?)\)/g, 'printf("%d\\n", $1);');

  out = out.replace(/\btrue\b/g, 'true'); out = out.replace(/\bfalse\b/g, 'false'); out = out.replace(/\bnull\b/g, 'NULL');

  // Math
  out = out.replace(/Math\.sqrt\s*\(/g, 'sqrt('); out = out.replace(/Math\.abs\s*\(/g, 'abs(');
  out = out.replace(/Math\.pow\s*\(([^,]+),\s*([^)]+)\)/g, 'pow($1, $2)');
  out = out.replace(/Math\.floor\s*\(/g, 'floor('); out = out.replace(/Math\.ceil\s*\(/g, 'ceil(');
  out = out.replace(/Math\.round\s*\(/g, 'round('); out = out.replace(/Math\.max\s*\(/g, 'fmax(');
  out = out.replace(/Math\.min\s*\(/g, 'fmin(');

  // .length → strlen()
  out = out.replace(/(\w+)\.length/g, 'strlen($1)');

  // String methods
  out = out.replace(/\.toUpperCase\(\)/g, '  /* use strupr() */');
  out = out.replace(/\.toLowerCase\(\)/g, '  /* use strlwr() */');
  out = out.replace(/\.trim\(\)/g, '  /* no direct C equivalent */');

  // Template literals
  out = out.replace(/`([^`]*)`/g, (_, s) => `"${s.replace(/\$\{(\w+)\}/g,'%d')}"  /* check format */`);

  // for..of → C for loop
  out = out.replace(/for\s*\((?:const|let|var)\s+(\w+)\s+of\s+(\w+)\)\s*\{/g, 'for (int i = 0; i < sizeof($2)/sizeof($2[0]); i++) { int $1 = $2[i];');
  // C-style for (already fine)
  out = out.replace(/for\s*\((?:let|var)\s+(\w+)/g, 'for (int $1');
  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while ($1) {');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if ($1) {');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, '} else if ($1) {');
  out = out.replace(/\}\s*else\s*\{/g, '} else {');

  // === → ==
  out = out.replace(/===/g, '=='); out = out.replace(/!==/g, '!=');

  // main wrapper
  if (!/int main/.test(out)) out += '\n\nint main(void) {\n    /* call your functions here */\n    return 0;\n}';

  notes.push('• Standard C headers added (<code>stdio.h, stdlib.h, string.h, stdbool.h, math.h</code>)');
  notes.push('• <code>function</code> → C function returning <code>int</code> (review types)');
  notes.push('• <code>console.log()</code> → <code>printf()</code>');
  notes.push('• <code>let/const/var</code> → <code>int</code> (review all variable types)');
  notes.push('• <code>===</code> → <code>==</code>');
  notes.push('• <strong>Manual review needed:</strong> Dynamic arrays (use malloc), strings (use char*), callbacks/closures, Promises/async');
  return { code: out, notes };
}

// ── JAVASCRIPT → C++ ──────────────────────────
function javascriptToCpp(code) {
  const notes = [];
  let out = code;

  out = `#include <iostream>\n#include <string>\n#include <vector>\n#include <map>\n#include <cmath>\n#include <algorithm>\nusing namespace std;\n\n` + out;

  // Arrow functions
  out = out.replace(/const (\w+)\s*=\s*\((.*?)\)\s*=>\s*\{/g, 'auto $1($2) {');
  out = out.replace(/const (\w+)\s*=\s*(\w+)\s*=>\s*\{/g, 'auto $1($2) {');
  out = out.replace(/function (\w+)\s*\((.*?)\)\s*\{/g, 'auto $1($2) {');

  // class
  out = out.replace(/class (\w+)\s+extends\s+(\w+)\s*\{/g, 'class $1 : public $2 {');
  out = out.replace(/class (\w+)\s*\{/g, 'class $1 {');
  out = out.replace(/constructor\s*\((.*?)\)\s*\{/g, '$1($2) {  /* TODO: replace $1 with class name */');

  // this.x → this->x (in methods)
  out = out.replace(/this\./g, 'this->');

  // Remove variable declaration keywords
  out = out.replace(/\b(const)\s+(\w+)\s*=/g, 'const auto $2 =');
  out = out.replace(/\b(let|var)\s+(\w+)\s*=/g, 'auto $2 =');

  // console.log → cout
  out = out.replace(/console\.log\s*\(`(.*?)`\)/g, (_, s) => {
    const parts = s.split(/\$\{(\w+)\}/);
    const coutParts = parts.map((p,i) => i%2===0 ? (p ? `"${p}"` : '') : p).filter(Boolean).join(' << ');
    return `cout << ${coutParts} << endl;`;
  });
  out = out.replace(/console\.log\s*\("(.*?)"\)/g, 'cout << "$1" << endl;');
  out = out.replace(/console\.log\s*\((\w+)\)/g, 'cout << $1 << endl;');
  out = out.replace(/console\.log\s*\((.*?)\)/g, 'cout << $1 << endl;');

  out = out.replace(/\btrue\b/g, 'true'); out = out.replace(/\bfalse\b/g, 'false'); out = out.replace(/\bnull\b/g, 'nullptr');

  // Math
  out = out.replace(/Math\.sqrt\s*\(/g, 'sqrt('); out = out.replace(/Math\.abs\s*\(/g, 'abs(');
  out = out.replace(/Math\.pow\s*\(([^,]+),\s*([^)]+)\)/g, 'pow($1, $2)');
  out = out.replace(/Math\.floor\s*\(/g, 'floor('); out = out.replace(/Math\.ceil\s*\(/g, 'ceil(');
  out = out.replace(/Math\.max\s*\(/g, 'max('); out = out.replace(/Math\.min\s*\(/g, 'min(');

  // .length → .size() for containers, .length() for string
  out = out.replace(/(\w+)\.length/g, '$1.size()');
  // Array methods
  out = out.replace(/\.push\s*\(/g, '.push_back(');
  out = out.replace(/\.pop\s*\(\s*\)/g, '  /* .pop_back() in C++ */');
  out = out.replace(/\.includes\s*\(/g, '  /* use find() in C++ */  /* .includes(');
  out = out.replace(/\.indexOf\s*\(/g, '  /* use find() */  /* .indexOf(');
  out = out.replace(/\.map\s*\(/g, '  /* use std::transform — .map(*/');
  out = out.replace(/\.filter\s*\(/g, '  /* use std::copy_if — .filter(*/');
  out = out.replace(/\.forEach\s*\(/g, '  /* use range-based for — .forEach(*/');
  out = out.replace(/\.join\s*\(/g, '  /* use ostringstream — .join(*/');

  // Template literals
  out = out.replace(/`([^`]*)`/g, (_, s) => {
    const parts = s.split(/\$\{(\w+)\}/);
    const joined = parts.map((p,i) => i%2===0 ? (p ? `"${p}"` : '') : p).filter(Boolean).join(' + ');
    return joined || '""';
  });

  out = out.replace(/\.toUpperCase\(\)/g, '  /* use transform()+toupper */');
  out = out.replace(/\.toLowerCase\(\)/g, '  /* use transform()+tolower */');
  out = out.replace(/\.trim\(\)/g, '  /* no direct C++ equivalent */');

  // for..of → range-based for
  out = out.replace(/for\s*\((?:const|let|var)\s+(\w+)\s+of\s+(\w+)\)\s*\{/g, 'for (auto& $1 : $2) {');
  // C-style for
  out = out.replace(/for\s*\((?:let|var)\s+(\w+)/g, 'for (int $1');
  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while ($1) {');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if ($1) {');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, '} else if ($1) {');
  out = out.replace(/\}\s*else\s*\{/g, '} else {');

  out = out.replace(/===/g, '=='); out = out.replace(/!==/g, '!=');

  if (!/int main/.test(out)) out += '\n\nint main() {\n    /* call your functions here */\n    return 0;\n}';

  notes.push('• C++ headers added: <code>iostream, string, vector, map, cmath, algorithm</code>');
  notes.push('• <code>function/arrow</code> → C++ function with <code>auto</code> return type');
  notes.push('• <code>console.log()</code> → <code>cout &lt;&lt; ... &lt;&lt; endl</code>');
  notes.push('• <code>let/var</code> → <code>auto</code>; <code>const</code> → <code>const auto</code>');
  notes.push('• <code>class</code> converted; <code>this.</code> → <code>this-&gt;</code>');
  notes.push('• <strong>Manual review needed:</strong> Array methods need STL equivalents, callbacks/closures→functors, Promises→futures, dynamic typing→explicit types');
  return { code: out, notes };
}

// ── JAVA → C ──────────────────────────────────
function javaToC(code) {
  const notes = [];
  let out = code;

  out = `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n#include <math.h>\n\n` + out;

  // Remove class wrapper
  out = out.replace(/public\s+class\s+\w+\s*(?:extends\s+\w+)?\s*\{([\s\S]*)\}/m, '$1');

  // Method → C function
  out = out.replace(/(?:public|private|protected|static|final|\s)+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g, (match, ret, name, params) => {
    if (/^(if|else|for|while|switch|do)$/.test(name)) return match;
    const cRet = {'int':'int','double':'double','float':'float','boolean':'bool','String':'char*','void':'void','long':'long','char':'char'}[ret]||'int';
    const cParams = params.split(',').map(p => {
      p=p.trim(); if(!p) return ''; const parts=p.split(/\s+/);
      const ptype = {'int':'int','double':'double','float':'float','boolean':'bool','String':'char*','void':'void','long':'long','char':'char'}[parts[0]]||'int';
      return `${ptype} ${parts[parts.length-1]}`;
    }).filter(Boolean).join(', ')||'void';
    return `${cRet} ${name}(${cParams}) {`;
  });

  // System.out.println → printf
  out = out.replace(/System\.out\.println\s*\("(.*?)"\)/g, 'printf("$1\\n")');
  out = out.replace(/System\.out\.println\s*\((\w+)\)/g, 'printf("%d\\n", $1)');
  out = out.replace(/System\.out\.printf\s*\((.*?)\)/g, 'printf($1)');
  out = out.replace(/System\.out\.print\s*\("(.*?)"\)/g, 'printf("$1")');

  out = out.replace(/\btrue\b/g, 'true'); out = out.replace(/\bfalse\b/g, 'false'); out = out.replace(/\bnull\b/g, 'NULL');
  out = out.replace(/\s*&&\s*/g, ' && '); out = out.replace(/\s*\|\|\s*/g, ' || ');

  // Math
  out = out.replace(/Math\.sqrt\s*\(/g, 'sqrt('); out = out.replace(/Math\.abs\s*\(/g, 'abs(');
  out = out.replace(/Math\.pow\s*\(([^,]+),\s*([^)]+)\)/g, 'pow($1, $2)');
  out = out.replace(/Math\.floor\s*\(/g, 'floor('); out = out.replace(/Math\.ceil\s*\(/g, 'ceil(');

  // String methods
  out = out.replace(/\.length\(\)/g, '  /* strlen() in C */');
  out = out.replace(/\.toUpperCase\(\)/g, '  /* strupr() */');
  out = out.replace(/\.toLowerCase\(\)/g, '  /* strlwr() */');
  out = out.replace(/\.trim\(\)/g, '  /* no direct C equivalent */');
  out = out.replace(/\.equals\s*\((\w+)\)/g, ' /* strcmp(s,$1)==0 */ ');
  out = out.replace(/\.charAt\s*\((\w+)\)/g, '[$1]');
  out = out.replace(/String\.valueOf\s*\((\w+)\)/g, '/* itoa($1) */');
  out = out.replace(/Integer\.parseInt\s*\((\w+)\)/g, 'atoi($1)');
  out = out.replace(/Double\.parseDouble\s*\((\w+)\)/g, 'atof($1)');

  // Type declarations: keep Java-compatible C types
  out = out.replace(/\b(int|double|float|long|char|boolean|String)\s+(\w+)\s*=/g, (m, t, name) => {
    const ct = {'boolean':'bool','String':'char*'}[t]||t;
    return `${ct} ${name} =`;
  });

  // for-each → C for loop
  out = out.replace(/for\s*\(\s*\w+\s+(\w+)\s*:\s*(\w+)\s*\)\s*\{/g, 'for (int i = 0; i < sizeof($2)/sizeof($2[0]); i++) {\n    /* $1 = $2[i]; */');
  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while ($1) {');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if ($1) {');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, '} else if ($1) {');
  out = out.replace(/\}\s*else\s*\{/g, '} else {');

  // main
  out = out.replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/g, 'int main(void) {');
  // Add return 0 before closing brace of main... tricky, add note
  if (!/int main/.test(out)) out += '\n\nint main(void) {\n    return 0;\n}';

  notes.push('• Standard C headers added');
  notes.push('• Java methods → C functions; Java types mapped to C types');
  notes.push('• <code>System.out.println()</code> → <code>printf()</code>');
  notes.push('• <code>boolean</code> → <code>bool</code> (stdbool.h); <code>String</code> → <code>char*</code>');
  notes.push('• <strong>Manual review needed:</strong> Classes→structs, interfaces, generics, exceptions, garbage collection→manual memory');
  return { code: out, notes };
}

// ── JAVA → C++ ────────────────────────────────
function javaToCpp(code) {
  const notes = [];
  let out = code;

  out = `#include <iostream>\n#include <string>\n#include <vector>\n#include <map>\n#include <cmath>\n#include <algorithm>\nusing namespace std;\n\n` + out;

  // Extract class body (keep class structure)
  out = out.replace(/public\s+class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{([\s\S]*)\}/m, (_, name, parent, body) =>
    parent ? `class ${name} : public ${parent} {\npublic:\n${body}\n};\n` : `class ${name} {\npublic:\n${body}\n};\n`);

  // Interface → abstract class
  out = out.replace(/interface\s+(\w+)\s*\{/g, 'class $1 {  // interface → abstract class');

  // Method defs
  out = out.replace(/(?:public|private|protected|static|final|\s)+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{/g, (match, ret, name, params) => {
    if (/^(if|else|for|while|switch|do)$/.test(name)) return match;
    const cppRet = {'int':'int','double':'double','float':'float','boolean':'bool','String':'string','void':'void','long':'long','char':'char'}[ret]||ret;
    const cppParams = params.split(',').map(p => {
      p=p.trim(); if(!p) return ''; const parts=p.split(/\s+/);
      const pt = {'int':'int','double':'double','float':'float','boolean':'bool','String':'string','void':'void','long':'long','char':'char'}[parts[0]]||parts[0];
      return `${pt} ${parts[parts.length-1]}`;
    }).filter(Boolean).join(', ')||'';
    return `${cppRet} ${name}(${cppParams}) {`;
  });

  // System.out.println → cout
  out = out.replace(/System\.out\.println\s*\("(.*?)"\)/g, 'cout << "$1" << endl');
  out = out.replace(/System\.out\.println\s*\((\w+)\)/g, 'cout << $1 << endl');
  out = out.replace(/System\.out\.printf\s*\((.*?)\)/g, 'printf($1)');

  out = out.replace(/\btrue\b/g, 'true'); out = out.replace(/\bfalse\b/g, 'false'); out = out.replace(/\bnull\b/g, 'nullptr');
  out = out.replace(/\s*&&\s*/g, ' && '); out = out.replace(/\s*\|\|\s*/g, ' || ');

  // Math
  out = out.replace(/Math\.sqrt\s*\(/g, 'sqrt('); out = out.replace(/Math\.abs\s*\(/g, 'abs(');
  out = out.replace(/Math\.pow\s*\(([^,]+),\s*([^)]+)\)/g, 'pow($1, $2)');

  // String → string
  out = out.replace(/\bString\b/g, 'string');
  out = out.replace(/\.length\(\)/g, '.length()');
  out = out.replace(/\.toUpperCase\(\)/g, '  /* use transform()+toupper */');
  out = out.replace(/\.toLowerCase\(\)/g, '  /* use transform()+tolower */');
  out = out.replace(/\.equals\s*\((\w+)\)/g, ' == $1 ');
  out = out.replace(/\.charAt\s*\((\w+)\)/g, '[$1]');
  out = out.replace(/\.substring\s*\((\d+),\s*(\d+)\)/g, '.substr($1, $2-$1)');
  out = out.replace(/String\.valueOf\s*\((\w+)\)/g, 'to_string($1)');
  out = out.replace(/Integer\.parseInt\s*\((\w+)\)/g, 'stoi($1)');
  out = out.replace(/Double\.parseDouble\s*\((\w+)\)/g, 'stod($1)');

  // ArrayList → vector
  out = out.replace(/ArrayList\s*<(\w+)>/g, 'vector<$1>');
  out = out.replace(/new ArrayList\s*<[^>]*>\s*\(\)/g, '{}');
  out = out.replace(/\.add\s*\(/g, '.push_back(');
  out = out.replace(/\.get\s*\((\w+)\)/g, '[$1]');
  out = out.replace(/\.size\s*\(\)/g, '.size()');
  out = out.replace(/\.isEmpty\s*\(\)/g, '.empty()');
  out = out.replace(/\.remove\s*\((\w+)\)/g, '.erase($1)');

  // HashMap → map
  out = out.replace(/HashMap\s*<([^>]+)>/g, 'map<$1>');
  out = out.replace(/new HashMap\s*<[^>]*>\s*\(\)/g, '{}');

  // boolean → bool
  out = out.replace(/\bboolean\b/g, 'bool');
  // int[] → int[] (keep or convert)
  out = out.replace(/(\w+)\[\]\s+(\w+)\s*=\s*new\s+\w+\[(\w+)\]/g, '$1 $2[$3]');

  // for-each
  out = out.replace(/for\s*\(\s*\w+\s+(\w+)\s*:\s*(\w+)\s*\)\s*\{/g, 'for (auto& $1 : $2) {');
  out = out.replace(/while\s*\((.+?)\)\s*\{/g, 'while ($1) {');
  out = out.replace(/if\s*\((.+?)\)\s*\{/g, 'if ($1) {');
  out = out.replace(/\}\s*else\s*if\s*\((.+?)\)\s*\{/g, '} else if ($1) {');
  out = out.replace(/\}\s*else\s*\{/g, '} else {');

  // main
  out = out.replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/g, 'int main() {');

  notes.push('• Java <code>class</code> → C++ <code>class</code> with <code>public:</code> section');
  notes.push('• <code>System.out.println()</code> → <code>cout</code>');
  notes.push('• <code>ArrayList</code> → <code>vector</code>; <code>HashMap</code> → <code>map</code>');
  notes.push('• <code>String</code> → <code>string</code>; <code>boolean</code> → <code>bool</code>');
  notes.push('• For-each → range-based for (<code>for (auto& x : container)</code>)');
  notes.push('• <strong>Manual review needed:</strong> Interfaces→abstract classes, generics→templates, exceptions, garbage collection→RAII/smart pointers');
  return { code: out, notes };
}

/* ════════════════════════════════════════════
   CONVERSION REGISTRY
════════════════════════════════════════════ */
const CONVERTERS = {
  'python-javascript':  pythonToJavaScript,
  'python-java':        pythonToJava,
  'python-go':          pythonToGo,
  'python-ruby':        pythonToRuby,
  'python-csharp':      pythonToCSharp,
  'python-rust':        pythonToRust,
  'python-c':           pythonToC,
  'python-cpp':         pythonToCpp,
  'javascript-python':  javascriptToPython,
  'javascript-typescript': javascriptToTypeScript,
  'javascript-php':     javascriptToPhp,
  'javascript-kotlin':  javascriptToKotlin,
  'javascript-c':       javascriptToC,
  'javascript-cpp':     javascriptToCpp,
  'typescript-javascript': typescriptToJavaScript,
  'java-python':        javaToPython,
  'java-c':             javaToC,
  'java-cpp':           javaToCpp,
  'c-python':           cToPython,
  'c-javascript':       cToJavaScript,
  'c-java':             cToJava,
  'cpp-python':         cppToPython,
  'cpp-javascript':     cppToJavaScript,
  'cpp-java':           cppToJava,
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
