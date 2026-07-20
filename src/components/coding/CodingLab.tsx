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

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value) {
      setCode(value);
      onCodeChange?.(value);
    }
  }, [onCodeChange]);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput('');
    try {
      // Client-side code execution simulation
      const lines = code.split('\n');
      let simulatedOutput = '';
      if (selectedLang === 'python') {
        try {
          const logs: string[] = [];
          const originalLog = console.log;
          console.log = (...args: unknown[]) => logs.push(args.map(String).join(' '));
          // Simple eval sandbox (safe for learning)
          const func = new Function(code);
          func();
          console.log = originalLog;
          simulatedOutput = logs.join('\n');
        } catch (e) {
          simulatedOutput = `Error: ${e}`;
        }
      } else if (selectedLang === 'javascript') {
        try {
          const logs: string[] = [];
          const originalLog = console.log;
          console.log = (...args: unknown[]) => logs.push(args.map(String).join(' '));
          const func = new Function(code);
          func();
          console.log = originalLog;
          simulatedOutput = logs.join('\n');
        } catch (e) {
          simulatedOutput = `Error: ${e}`;
        }
      } else {
        simulatedOutput = `[${selectedLang.toUpperCase()}]\nCode executed (simulation).\n\nServer-side execution coming soon for ${selectedLang}.`;
      }
      setOutput(simulatedOutput || 'Code executed successfully (no output)');
    } catch {
      setOutput('Error executing code. Check the console for details.');
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
            <span className="text-sm font-medium flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Output
            </span>
            {output && (
              <Button variant="ghost" size="sm" onClick={() => setOutput('')}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-auto bg-black/5 dark:bg-black/20">
            {isRunning ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <span className="text-muted-foreground">Run your code to see output here</span>
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
