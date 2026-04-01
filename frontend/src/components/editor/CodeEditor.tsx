import { Editor } from '@monaco-editor/react';
import { useState } from 'react';
import { Download, Copy } from 'lucide-react';
import Button from '../ui/Button';
import { CODE_LANGUAGES } from '../utils/constants';
 
interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}
 
export default function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
}: CodeEditorProps) {
  const [theme, setTheme] = useState<'light' | 'vs-dark'>('vs-dark');
 
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };
 
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };
 
  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language === 'javascript' ? 'js' : language}`;
    a.click();
    URL.revokeObjectURL(url);
  };
 
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
          >
            {CODE_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
 
          <button
            onClick={() => setTheme(theme === 'light' ? 'vs-dark' : 'light')}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
 
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
 
      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleEditorChange}
          theme={theme}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}