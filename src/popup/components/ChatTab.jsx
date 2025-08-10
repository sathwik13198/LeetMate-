import React, { useState, useRef, useEffect } from 'react';
import CodeHighlighter from './CodeHighlighter';

const ChatTab = ({ problem }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focus on input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      const inputElement = document.querySelector('.chat-input-container input');
      if (inputElement) {
        inputElement.focus();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Get API key from storage
      const result = await chrome.storage.local.get(['geminiApiKey']);
      const apiKey = result.geminiApiKey;
      
      if (!apiKey) {
        setMessages(prev => [
          ...prev, 
          {
            id: Date.now() + 1,
            text: 'Please add your Gemini 2.0 Flash API key in the Settings tab',
            sender: 'bot'
          }
        ]);
        setLoading(false);
        return;
      }
      
      // Call the generateResponse function to get a response from the API
      const responseText = await generateResponse(input);
      
      const botMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
      
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now() + 1,
          text: 'Error sending message. Please try again.',
          sender: 'bot'
        }
      ]);
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  const generateResponse = async (query) => {
    try {
      // Get current problem data
      const result = await chrome.storage.local.get(['currentProblem']);
      const problemData = result.currentProblem;
      
      if (!problemData || !problemData.title) {
        return "I couldn't find any LeetCode problem data. Please make sure you're on a LeetCode problem page and refresh the extension.";
      }
      
      // Call the background script to get a response from Gemini 2.0 Flash API
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'askQuestion',
          title: problemData.title,
          description: problemData.description,
          constraints: problemData.constraints,
          examples: problemData.examples,
          question: query
        }, (response) => {
          if (response.error) {
            reject(response.error);
          } else if (response.data && response.data.candidates && response.data.candidates[0].content) {
            resolve(response.data.candidates[0].content.parts[0].text);
          } else {
            reject('Invalid response from Gemini 2.0 Flash API');
          }
        });
      });
    } catch (error) {
      console.error('Error generating response:', error);
      return "Sorry, I encountered an error while generating a response. Please try again.";
    }
  };

  // Function to render message content with code highlighting and proper formatting
  const renderMessageContent = (text) => {
    // Check if the message contains code blocks
    if (text.includes('```')) {
      const parts = text.split(/```(\w*)\n/);
      return (
        <>
          {parts.map((part, index) => {
            // Code block language
            if (index % 3 === 1) return null;
            
            // Code block content
            if (index % 3 === 2) {
              const language = parts[index - 1] || 'javascript';
              return (
                <div key={index} className="code-block">
                  <CodeHighlighter code={part.trim()} language={language} />
                </div>
              );
            }
            
            // Format regular text with bullet points
            if (part) {
              // Process text to handle bullet points and emojis
              return formatTextWithBulletPoints(part, index);
            }
            return null;
          })}
        </>
      );
    }
    
    // Format regular text message with bullet points
    return formatTextWithBulletPoints(text, 0);
  };
  
  // Helper function to format text with bullet points and preserve emojis
  const formatTextWithBulletPoints = (text, key) => {
    if (!text) return null;
    
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
    
    // If we have sections, process them
    if (matches.length > 0) {
      // Process each section
      matches.forEach((match, i) => {
        // Add content before this section if it's not the first match
        if (match.index > lastIndex) {
          const beforeText = text.substring(lastIndex, match.index);
          if (beforeText.trim()) {
            sections.push({
              type: 'content',
              text: beforeText.trim()
            });
          }
        }
        
        // Add the section header
        sections.push({
          type: 'header',
          number: match.sectionNumber,
          title: match.sectionTitle
        });
        
        // Update lastIndex to after this section header
        lastIndex = match.index + match.fullMatch.length;
        
        // Add content after this section header until the next section or end
        const nextIndex = i < matches.length - 1 ? matches[i + 1].index : text.length;
        const sectionContent = text.substring(lastIndex, nextIndex);
        if (sectionContent.trim()) {
          sections.push({
            type: 'content',
            text: sectionContent.trim()
          });
        }
        
        // Update lastIndex for next iteration
        lastIndex = nextIndex;
      });
      
      // Add any remaining content after the last section
      if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex);
        if (remainingText.trim()) {
          sections.push({
            type: 'content',
            text: remainingText.trim()
          });
        }
      }
    } else {
      // No sections found, treat the whole text as one content section
      sections.push({
        type: 'content',
        text: text.trim()
      });
    }
    
    // Render the sections
    return (
      <div key={key} className="formatted-message">
        {sections.map((section, sectionIndex) => {
          if (section.type === 'header') {
            return (
              <h3 key={`section-${sectionIndex}`} className="section-header">
                {section.number} {section.title}
              </h3>
            );
          } else {
            // Process content sections into paragraphs and bullet points
            const paragraphs = section.text.split('\n').filter(p => p.trim());
            
            return (
              <div key={`content-${sectionIndex}`} className="section-content">
                {paragraphs.map((paragraph, pIndex) => {
                  // Check if paragraph already has bullet points
                  if (paragraph.trim().startsWith('•') || 
                      paragraph.trim().startsWith('-') || 
                      paragraph.trim().startsWith('*')) {
                    return <p key={`p-${sectionIndex}-${pIndex}`}>{paragraph}</p>;
                  }
                  
                  // Check if it's a heading or title (ends with colon)
                  if (paragraph.trim().endsWith(':')) {
                    return <p key={`p-${sectionIndex}-${pIndex}`} className="sub-heading">{paragraph}</p>;
                  }
                  
                  // Check for emojis at the beginning
                  const emojiMatch = paragraph.match(/^\s*(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Component}|\p{Emoji_Modifier_Base})+/u);
                  const emoji = emojiMatch ? emojiMatch[0] : '';
                  const textContent = emojiMatch ? paragraph.slice(emojiMatch[0].length) : paragraph;
                  
                  // If it's a short line with emoji, keep it as is
                  if (emoji && textContent.length < 50) {
                    return <p key={`p-${sectionIndex}-${pIndex}`}>{paragraph}</p>;
                  }
                  
                  // For regular paragraphs, add bullet points
                  return <p key={`p-${sectionIndex}-${pIndex}`} className="bullet-point">• {emoji} {textContent.trim()}</p>;
                })}
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div id="chatContent" className="tab-content">
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Ask anything about {problem.title || 'this problem'}!</p>
            <p>I can explain solutions, optimize code, or give you hints.</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {renderMessageContent(message.text)}
            </div>
          ))
        )}
        {loading && (
          <div className="message bot-message loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask anything about this problem..." 
          aria-label="Chat message input"
        />
        <button 
          onClick={handleSendMessage}
          disabled={!input.trim()}
          title="Send message"
        >
          Send
        </button>
      </div>
      
      <div className="quick-prompts">
        <button 
          className="prompt-btn"
          onClick={() => handlePromptClick('Explain in baby steps')}
          title="Get a step-by-step explanation"
        >
          Explain in baby steps
        </button>
        <button 
          className="prompt-btn"
          onClick={() => handlePromptClick('Optimize this solution')}
          title="Get optimization suggestions"
        >
          Optimize solution
        </button>
        <button 
          className="prompt-btn"
          onClick={() => handlePromptClick('Give me hints only')}
          title="Get hints without full solution"
        >
          Hints only
        </button>
      </div>
    </div>
  );
};

export default ChatTab;