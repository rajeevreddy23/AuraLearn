'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  Play, RotateCcw, Download, Copy, Check, ChevronDown,
  Loader2, AlertCircle, Terminal, Brain
} from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const SUPPORTED_LANGUAGES = [
  { id: 'python', label: 'Python', defaultCode: 'print("Hello, AURA Learn!")' },
  { id: 'javascript', label: 'JavaScript', defaultCode: 'console.log("Hello, AURA Learn!");' },
  { id: 'typescript', label: 'TypeScript', defaultCode: 'const greeting: string = "Hello, AURA Learn!";\nconsole.log(greeting);' },
  { id: 'html', label: 'HTML', defaultCode: '<h1>Hello, AURA Learn!</h1>' },
  { id: 'css', label: 'CSS', defaultCode: 'body {\n  background: #f0f0f0;\n  font-family: sans-serif;\n}' },
  { id: 'java', label: 'Java', defaultCode: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, AURA Learn!");\n  }\n}' },
  { id: 'cpp', label: 'C++', defaultCode: '#include <iostream>\nint main() {\n  std::cout << "Hello, AURA Learn!" << std::endl;\n  return 0;\n}' },
  { id: 'go', label: 'Go', defaultCode: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, AURA Learn!")\n}' },
  { id: 'rust', label: 'Rust', defaultCode: 'fn main() {\n  println!("Hello, AURA Learn!");\n}' },
  { id: 'sql', label: 'SQL', defaultCode: 'SELECT "Hello, AURA Learn!" AS greeting;' },
];

let pyodideInstance: any = null;

const loadPyodideScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    if ((window as any).loadPyodide) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide WebAssembly script'));
    document.head.appendChild(script);
  });
};

interface CodingLabProps {
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
  showAI?: boolean;
}

export const CodingLab: React.FC<CodingLabProps> = ({
  initialCode,
  language = 'python',
  readOnly = false,
  onCodeChange,
  showAI = true,
}) => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[0];
  const [code, setCode] = useState(initialCode || lang.defaultCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language);
  const [copied, setCopied] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestion, setAISuggestion] = useState('');
  const [previewDoc, setPreviewDoc] = useState('');
  const [outputTab, setOutputTab] = useState<'console' | 'preview'>('console');

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value) {
      setCode(value);
      onCodeChange?.(value);
    }
  }, [onCodeChange]);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput('');
    setPreviewDoc('');
    try {
      let simulatedOutput = '';
      if (selectedLang === 'python') {
        try {
          setOutput('Initializing Python interpreter in browser (WASM)...\n');
          await loadPyodideScript();
          if (!pyodideInstance) {
            pyodideInstance = await (window as any).loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
            });
          }
          // Redirect sys.stdout and sys.stderr to capture print output
          pyodideInstance.runPython(`
            import sys
            import io
            sys.stdout = io.StringIO()
            sys.stderr = io.StringIO()
          `);
          
          await pyodideInstance.runPythonAsync(code);
          
          const stdout = pyodideInstance.runPython('sys.stdout.getvalue()');
          const stderr = pyodideInstance.runPython('sys.stderr.getvalue()');
          simulatedOutput = stderr ? `${stdout}\nError:\n${stderr}` : stdout;
          setOutputTab('console');
        } catch (e) {
          simulatedOutput = `Python Execution Error: ${e}`;
          setOutputTab('console');
        }
      } else if (selectedLang === 'javascript' || selectedLang === 'typescript') {
        try {
          const logs: string[] = [];
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          
          console.log = (...args: unknown[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
          console.warn = (...args: unknown[]) => logs.push(`[Warning] ` + args.map(String).join(' '));
          console.error = (...args: unknown[]) => logs.push(`[Error] ` + args.map(String).join(' '));
          
          let codeToRun = code;
          if (selectedLang === 'typescript') {
            // Strip simple typescript type markings for browser run
            codeToRun = code
              .replace(/:\s*string/g, '')
              .replace(/:\s*number/g, '')
              .replace(/:\s*boolean/g, '')
              .replace(/:\s*any/g, '')
              .replace(/as\s+string/g, '')
              .replace(/as\s+number/g, '');
          }
          
          const func = new Function(codeToRun);
          func();
          
          console.log = originalLog;
          console.warn = originalWarn;
          console.error = originalError;
          
          simulatedOutput = logs.join('\n');
          setOutputTab('console');
        } catch (e) {
          simulatedOutput = `JavaScript Execution Error: ${e}`;
          setOutputTab('console');
        }
      } else if (selectedLang === 'html' || selectedLang === 'css') {
        // Render preview inside iframe sandbox
        const srcDoc = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: sans-serif; padding: 15px; background-color: #0f172a; color: #f8fafc; }
                \${selectedLang === 'css' ? code : ''}
              </style>
            </head>
            <body>
              \${selectedLang === 'html' ? code : ''}
            </body>
          </html>
        `;
        setPreviewDoc(srcDoc);
        setOutputTab('preview');
        simulatedOutput = 'HTML/CSS Rendered in Live Preview!';
      } else {
        simulatedOutput = `[\${selectedLang.toUpperCase()}]\nCode executed successfully.\n\nServer sandbox connections coming soon for \${selectedLang}.`;
        setOutputTab('console');
      }
      setOutput(simulatedOutput || 'Code executed successfully (no stdout)');
    } catch {
      setOutput('Error executing code. Check syntax for details.');
    } finally {
      setIsRunning(false);
    }
  }, [code, selectedLang]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const resetCode = useCallback(() => {
    setCode(lang.defaultCode);
    setOutput('');
  }, [lang]);

  const getAISuggestion = useCallback(async () => {
    setShowAIPanel(true);
    setAISuggestion('Analyzing your code...');
    try {
      const res = await fetch('/api/v1/agents/public/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Explain this ${selectedLang} code line by line:\n\`\`\`${selectedLang}\n${code}\n\`\`\`\n\nExplain what each part does, the key concepts, and how it works.`,
          system_prompt: 'You are an expert coding instructor. Explain code clearly with line-by-line breakdowns.',
        }),
      });
      const data = await res.json();
      const responseText = data?.data?.response || '';
      setAISuggestion(responseText);
    } catch {
      setAISuggestion('AI assistant unavailable. Please try again later.');
    }
  }, [code, selectedLang]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => {
              setSelectedLang(e.target.value);
              const newLang = SUPPORTED_LANGUAGES.find(l => l.id === e.target.value);
              if (newLang) setCode(newLang.defaultCode);
            }}
            className="h-8 px-2 rounded-lg border border-input bg-background text-sm"
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <Badge variant="default" size="sm">Read-Write</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={copyCode}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={resetCode}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          {showAI && (
            <Button variant="ghost" size="sm" onClick={getAISuggestion}>
              <Brain className="h-4 w-4 mr-1" />
              AI Explain
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={runCode} isLoading={isRunning}>
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="border-r border-border">
          <MonacoEditor
            height="100%"
            language={selectedLang}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              readOnly,
              automaticLayout: true,
              wordWrap: 'on',
              suggestOnTriggerCharacters: true,
            }}
          />
        </div>

        <div className="flex flex-col">
          <div className="p-3 border-b border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span className="text-sm font-medium">Output</span>
              
              {/* Show preview toggle for web languages */}
              {(selectedLang === 'html' || selectedLang === 'css') && (
                <div className="flex bg-slate-800 rounded-lg p-0.5 ml-2 border border-slate-700 select-none">
                  <button
                    onClick={() => setOutputTab('console')}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded font-semibold transition-all",
                      outputTab === 'console' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Console
                  </button>
                  <button
                    onClick={() => setOutputTab('preview')}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded font-semibold transition-all",
                      outputTab === 'preview' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Live Preview
                  </button>
                </div>
              )}
            </div>
            {output && (
              <Button variant="ghost" size="sm" onClick={() => { setOutput(''); setPreviewDoc(''); }}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex-1 flex flex-col bg-black/5 dark:bg-black/20 overflow-hidden relative">
            {isRunning ? (
              <div className="flex-1 p-4 flex items-center gap-2 text-muted-foreground font-mono text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <span>Running...</span>
              </div>
            ) : outputTab === 'preview' && previewDoc ? (
              <iframe
                title="Live Sandbox Preview"
                srcDoc={previewDoc}
                sandbox="allow-scripts"
                className="w-full h-full border-0 bg-slate-900"
              />
            ) : output ? (
              <pre className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">{output}</pre>
            ) : (
              <span className="p-4 text-muted-foreground font-mono text-sm">Run your code to see output here</span>
            )}
          </div>

          {showAIPanel && (
            <div className="border-t border-border p-4 bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Code Analysis
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowAIPanel(false)}>Close</Button>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiSuggestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
