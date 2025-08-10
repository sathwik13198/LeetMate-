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
    
    // Format explanation with bullet points for better structure
    explanationText = formatWithBulletPoints(explanationText);
    
    // Extract complexity (should be after the code block)
    let complexityText = '';
    if (sections.length > 2) {
      complexityText = sections[sections.length - 1].trim();
      // Format complexity with bullet points
      complexityText = formatWithBulletPoints(complexityText);
    }
    
    // Update solution state
    setSolution({
      code: code.trim(),
      explanation: explanationText,
      complexity: complexityText
    });
    
    setLoading(false);
  };
  
  // Helper function to format text with bullet points and preserve emojis
  const formatWithBulletPoints = (text) => {
    if (!text) return '';
    
    // Split by sections (numbered sections or headings)
    const sections = [];
    
    // Check if text has sections with numbers (like "1. Title:")
    const sectionRegex = /(^|\n)(\d+\.)\s+([^\n]+)(?:\n|$)/g;
    let lastIndex = 0;
    let match;
    
    // Find all section headers
    const matches = [];
    while ((match = sectionRegex.exec(text)) !== null) {
      matches.push({
        fullMatch: match[0],
        index: match.index,
        sectionNumber: match[2],
        sectionTitle: match[3]
      });
    }
    
    // Process text based on sections
    let formattedText = '';
    
    // If we have sections, process them
    if (matches.length > 0) {
      // Process each section
      matches.forEach((match, i) => {
        // Add section header
        formattedText += `${match.sectionNumber} ${match.sectionTitle}\n`;
        
        // Get content until next section or end
        const nextIndex = i < matches.length - 1 ? matches[i + 1].index : text.length;
        const startIndex = match.index + match.fullMatch.length;
        const sectionContent = text.substring(startIndex, nextIndex).trim();
        
        // Format section content with bullet points
        if (sectionContent) {
          formattedText += formatContentWithBullets(sectionContent) + '\n';
        }
      });
    } else {
      // No sections found, format the whole text
      formattedText = formatContentWithBullets(text);
    }
    
    return formattedText.trim();
  };
  
  // Helper function to format content with bullet points
  const formatContentWithBullets = (content) => {
    const lines = [];
    
    // Split by paragraphs and process each
    const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');
    
    paragraphs.forEach(paragraph => {
      // Check if paragraph already has bullet points or numbering
      if (paragraph.match(/^\s*[-*•]\s/) || paragraph.match(/^\s*\d+\.\s/)) {
        // Keep existing bullet points
        paragraph.split('\n').forEach(line => {
          if (line.trim()) lines.push(line);
        });
        return;
      }
      
      // Check if it's a heading (ends with colon)
      const paragraphLines = paragraph.split('\n');
      if (paragraphLines[0].endsWith(':')) {
        // Add the heading
        lines.push(paragraphLines[0]);
        
        // Add the rest as bullet points
        if (paragraphLines.length > 1) {
          paragraphLines.slice(1).forEach(line => {
            if (line.trim()) {
              // Check for emojis at beginning
              const emojiMatch = line.match(/^\s*(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Component}|\p{Emoji_Modifier_Base})+/u);
              const emoji = emojiMatch ? emojiMatch[0] : '';
              const textContent = emojiMatch ? line.slice(emojiMatch[0].length) : line;
              lines.push(`• ${emoji} ${textContent.trim()}`);
            }
          });
        }
        return;
      }
      
      // For regular paragraphs, split by sentences
      if (paragraph.includes('. ')) {
        const sentences = paragraph.split('. ').filter(s => s.trim() !== '');
        sentences.forEach(s => {
          if (s.trim()) {
            // Preserve emojis at the beginning of sentences
            const emojiMatch = s.match(/^\s*(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Component}|\p{Emoji_Modifier_Base})+/u);
            const emoji = emojiMatch ? emojiMatch[0] : '';
            const textContent = emojiMatch ? s.slice(emojiMatch[0].length) : s;
            lines.push(`• ${emoji} ${textContent.trim()}${!s.endsWith('.') ? '.' : ''}`);
          }
        });
        return;
      }
      
      // For single sentences or short paragraphs
      if (paragraph.trim()) {
        // Check for emojis at the beginning
        const emojiMatch = paragraph.match(/^\s*(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Component}|\p{Emoji_Modifier_Base})+/u);
        const emoji = emojiMatch ? emojiMatch[0] : '';
        const textContent = emojiMatch ? paragraph.slice(emojiMatch[0].length) : paragraph;
        
        // If it's a short line with emoji, keep it as is without bullet
        if (emoji && textContent.length < 50 && !textContent.includes('. ')) {
          lines.push(`${paragraph.trim()}`);
        } else {
          lines.push(`• ${emoji} ${textContent.trim()}`);
        }
      }
    });
    
    return lines.join('\n');
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
          {solution.explanation.split('\n').map((line, index) => {
            // Check if line is a bullet point
            if (line.startsWith('• ')) {
              return <div key={index} className="bullet-point">{line.substring(2)}</div>;
            }
            // Check if line is a section header (ends with colon)
            else if (line.endsWith(':')) {
              return <div key={index} className="section-header">{line}</div>;
            }
            // Check if line is a numbered header (like "1. Title")
            else if (/^\d+\.\s+.+/.test(line)) {
              return <div key={index} className="section-header">{line}</div>;
            }
            // Regular line
            else {
              return <div key={index}>{line}</div>;
            }
          })}
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
          {solution.complexity.split('\n').map((line, index) => {
            // Check if line is a bullet point
            if (line.startsWith('• ')) {
              return <div key={index} className="bullet-point">{line.substring(2)}</div>;
            }
            // Check if line is a section header (ends with colon)
            else if (line.endsWith(':')) {
              return <div key={index} className="section-header">{line}</div>;
            }
            // Check if line is a numbered header (like "1. Title")
            else if (/^\d+\.\s+.+/.test(line)) {
              return <div key={index} className="section-header">{line}</div>;
            }
            // Regular line
            else {
              return <div key={index}>{line}</div>;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default SolutionTab;