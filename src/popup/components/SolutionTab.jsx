import React, { useState, useEffect } from 'react';
import CodeHighlighter from './CodeHighlighter';

const SolutionTab = ({ problem }) => {
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [solution, setSolution] = useState({
    code: '',
    explanation: '',
    complexity: ''
  });

  useEffect(() => {
    if (problem && problem.title && problem.title !== 'Loading problem...' && !problem.title.startsWith('Error:')) {
      generateSolution();
    }
  }, [problem, language]);

  const generateSolution = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get API key from storage
      const result = await chrome.storage.local.get(['geminiApiKey']);
      const apiKey = result.geminiApiKey;
      
      if (!apiKey) {
        setError('Please add your Gemini 2.0 Flash API key in the Settings tab');
        setLoading(false);
        return;
      }
      
      // Call the Gemini API through the background script
      chrome.runtime.sendMessage({
        type: 'solveProblem',
        title: problem.title,
        description: problem.description,
        constraints: problem.constraints,
        examples: problem.examples,
        language: language
      }, (response) => {
        if (response.error) {
          setError(response.error);
          setLoading(false);
          return;
        }
        
        if (response.data && response.data.candidates && response.data.candidates[0].content) {
          // Parse response
          const aiResponse = response.data.candidates[0].content.parts[0].text;
          parseAIResponse(aiResponse);
        } else {
          setError('Invalid response from Gemini 2.0 Flash API. Please try again.');
          setLoading(false);
        }
      });
      
    } catch (err) {
      setError('Error generating solution. Please try again.');
      setLoading(false);
    }
  };
  
  // Parse AI response to extract explanation, code, and complexity
  const parseAIResponse = (response) => {
    // Split response by code blocks
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      codeBlocks.push(match[1]);
    }
    
    // Extract code (should be the first or second code block)
    let code = '';
    if (codeBlocks.length > 0) {
      // Check if the first block starts with a language identifier
      if (codeBlocks[0].trim().startsWith(language.toLowerCase()) || 
          codeBlocks[0].trim().startsWith('javascript') || 
          codeBlocks[0].trim().startsWith('python') || 
          codeBlocks[0].trim().startsWith('java') || 
          codeBlocks[0].trim().startsWith('cpp')) {
        // Remove language identifier from first line
        code = codeBlocks[0].replace(/^.*\n/, '');
      } else if (codeBlocks.length > 1) {
        code = codeBlocks[1];
      } else {
        code = codeBlocks[0];
      }
    }
    
    // Split response by sections
    const sections = response.split('```');
    
    // Extract explanation (should be before the first code block)
    let explanationText = sections[0].trim();
    
    // Extract complexity (should be after the code block)
    let complexityText = '';
    if (sections.length > 2) {
      complexityText = sections[sections.length - 1].trim();
    }
    
    // Update solution state
    setSolution({
      code: code.trim(),
      explanation: explanationText,
      complexity: complexityText
    });
    
    setLoading(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(solution.code);
    // Show a toast or some indication that code was copied
  };

  const handleRefresh = () => {
    generateSolution();
  };

  return (
    <div id="solutionContent" className="tab-content active">
      <div className="problem-title">{problem.title}</div>
      
      <div className="language-selector">
        <label htmlFor="languageSelect">Language:</label>
        <select 
          id="languageSelect" 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <button 
          className="refresh-btn" 
          onClick={handleRefresh}
          disabled={loading}
        >
          ↻
        </button>
      </div>
      
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Generating solution...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {solution.explanation && !loading && (
        <div className="explanation">
          {solution.explanation}
        </div>
      )}
      
      {solution.code && !loading && (
        <div className="code-container">
          <div className="code-header">
            <span>Solution</span>
            <button className="copy-btn" onClick={handleCopyCode}>Copy</button>
          </div>
          <CodeHighlighter code={solution.code} language={language} />
        </div>
      )}
      
      {solution.complexity && !loading && (
        <div className="complexity">
          {solution.complexity}
        </div>
      )}
    </div>
  );
};

export default SolutionTab;