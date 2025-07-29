import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronRight, Copy, Clock } from 'lucide-react';

const LogsDisplay = ({ logs, timestamp }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const parseLogEntry = (log, index) => {
    const parts = [];
    const regex = /\[.*?\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(log)) !== null) {
      const before = log.slice(lastIndex, match.index);
      const bracketed = match[0];
      lastIndex = regex.lastIndex;

      if (before) {
        parts.push(
          <span key={`text-${index}-${lastIndex}`} className="text-gray-700 dark:text-gray-300">
            {before}
          </span>
        );
      }

      parts.push(
        <div key={`bracket-${index}-${lastIndex}`} className="relative group my-3">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400 font-medium">Code Block</span>
              </div>
              <button
                onClick={() => copyToClipboard(bracketed, index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <pre className="text-sm text-green-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {bracketed}
            </pre>
          </div>
        </div>
      );
    }

    if (lastIndex < log.length) {
      parts.push(
        <span key={`text-end-${index}`} className="text-gray-700 dark:text-gray-300">
          {log.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  if (logs.length === 0) return null;

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
            <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
              Execution Logs
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>
        
        {timestamp && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-4 space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
          {logs.map((log, index) => (
            <div key={index} className="relative group">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <div className="prose prose-sm max-w-none">
                      {parseLogEntry(log, index)}
                    </div>
                  </div>
                  
                  {copiedIndex === index && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg animate-fade-in">
                      Copied!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogsDisplay;
