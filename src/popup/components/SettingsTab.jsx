import React, { useState, useEffect } from 'react';

const SettingsTab = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load API key from storage
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      if (result.geminiApiKey) {
        setApiKey(result.geminiApiKey);
      }
    });
  }, []);

  const handleSaveApiKey = () => {
    chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    });
  };

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <div id="settingsContent" className="tab-content">
      <div className="settings-group">
        <label htmlFor="apiKeyInput">Gemini 2.0 Flash API Key:</label>
        <div className="api-key-container">
          <input 
            type={showApiKey ? 'text' : 'password'} 
            id="apiKeyInput" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini 2.0 Flash API key" 
          />
          <button 
            className="show-btn"
            onClick={toggleShowApiKey}
            title={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {showApiKey ? '🔒' : '👁️'}
          </button>
        </div>
        <button 
          className="save-btn"
          onClick={handleSaveApiKey}
        >
          Save API Key
        </button>
        {saveSuccess && (
          <div className="success-message">✅ API key saved successfully</div>
        )}
      </div>
      
      <div className="settings-group">
        <h3>About LeetCode Gen Z Solver</h3>
        <p>Version 1.0</p>
        <p>This Chrome extension helps you solve LeetCode problems with Gen Z style explanations, providing clear solutions and interactive chat assistance.</p>
        <p>To get a Gemini 2.0 Flash API key, visit: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></p>
      </div>
    </div>
  );
};

export default SettingsTab;