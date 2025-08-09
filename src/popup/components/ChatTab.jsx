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

  // Function to render message content with code highlighting
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
            
            // Regular text
            return part ? <p key={index}>{part}</p> : null;
          })}
        </>
      );
    }
    
    // Regular text message
    return <p>{text}</p>;
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