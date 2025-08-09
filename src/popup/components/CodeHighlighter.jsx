import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeHighlighter = ({ code, language }) => {
  // Map language names to react-syntax-highlighter supported languages
  const languageMap = {
    'JavaScript': 'javascript',
    'Python': 'python',
    'Java': 'java',
    'C++': 'cpp',
    'javascript': 'javascript',
    'python': 'python',
    'java': 'java',
    'cpp': 'cpp'
  };

  // Custom theme based on VSCode Dark+
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: '#1e1e1e',
      borderRadius: '0 0 8px 8px',
      margin: 0,
      padding: '1em',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      fontFamily: '"Fira Code", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    'comment': {
      ...vscDarkPlus['comment'],
      color: '#6a9955'
    },
    'string': {
      ...vscDarkPlus['string'],
      color: '#ce9178'
    },
    'keyword': {
      ...vscDarkPlus['keyword'],
      color: '#569cd6'
    },
    'function': {
      ...vscDarkPlus['function'],
      color: '#dcdcaa'
    },
    'number': {
      ...vscDarkPlus['number'],
      color: '#b5cea8'
    },
    'operator': {
      ...vscDarkPlus['operator'],
      color: '#d4d4d4'
    },
    'class-name': {
      ...vscDarkPlus['class-name'],
      color: '#4ec9b0'
    },
    'builtin': {
      ...vscDarkPlus['builtin'],
      color: '#4ec9b0'
    },
    'boolean': {
      ...vscDarkPlus['boolean'],
      color: '#569cd6'
    },
    'punctuation': {
      ...vscDarkPlus['punctuation'],
      color: '#d4d4d4'
    }
  };

  return (
    <SyntaxHighlighter 
      language={languageMap[language] || 'javascript'} 
      style={customStyle}
      showLineNumbers={true}
      wrapLines={true}
      customStyle={{
        margin: 0,
        borderRadius: '0 0 8px 8px',
        fontSize: '14px',
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeHighlighter;