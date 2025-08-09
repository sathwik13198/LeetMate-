import React, { useState, useEffect } from 'react';
import Header from './Header';
import SolutionTab from './SolutionTab';
import ChatTab from './ChatTab';
import SettingsTab from './SettingsTab';
import '../styles/index.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('solution');
  const [currentProblem, setCurrentProblem] = useState({
    title: 'Loading problem...',
    description: '',
    constraints: '',
    examples: ''
  });
  
  useEffect(() => {
    // Check if we have a problem to solve
    checkForProblem();
    
    // Load API key from storage
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      if (result.geminiApiKey) {
        // API key is available
      }
    });
  }, []);
  
  const checkForProblem = () => {
    // First try to get problem data from storage
    chrome.storage.local.get(['currentProblem'], (result) => {
      if (result.currentProblem && result.currentProblem.title) {
        console.log('Found problem data in storage:', result.currentProblem.title);
        setCurrentProblem(result.currentProblem);
        return;
      }
      
      // If not in storage, query the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          console.error('No active tab found');
          return;
        }
        
        const activeTab = tabs[0];
        
        // Check if we're on a LeetCode problem page
        if (activeTab.url.includes('leetcode.com/problems/')) {
          console.log('On LeetCode problem page, requesting data from content script');
          // Send message to content script to get problem data
          try {
            chrome.tabs.sendMessage(activeTab.id, { action: 'getProblemData' }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('Error sending message to content script:', chrome.runtime.lastError);
                // Set a default problem or show error state
                setCurrentProblem(prev => ({
                  ...prev,
                  title: 'Error: Could not connect to LeetCode',
                  description: 'There was an error communicating with the LeetCode page. Please refresh the page and try again.'
                }));
                return;
              }
            
            if (response && response.title) {
              console.log('Received problem data from content script:', response.title);
              setCurrentProblem({
                title: response.title,
                description: response.description,
                constraints: response.constraints,
                examples: response.examples,
                language: response.language
              });
            } else if (response && response.error) {
              console.error('Error from content script:', response.error);
              setCurrentProblem(prev => ({
                ...prev,
                title: 'Error: ' + response.error,
                description: 'Please refresh the LeetCode page and try again.'
              }));
            } else {
              console.error('No valid response from content script');
              setCurrentProblem(prev => ({
                ...prev,
                title: 'Error: Invalid response',
                description: 'Received an invalid response from the LeetCode page.'
              }));
            }
          });
          } catch (error) {
            console.error('Exception when sending message to content script:', error);
            setCurrentProblem(prev => ({
              ...prev,
              title: 'Error: Exception occurred',
              description: 'An exception occurred while trying to communicate with the LeetCode page.'
            }));
          }
        } else {
          console.log('Not on a LeetCode problem page');
          setCurrentProblem(prev => ({
            ...prev,
            title: 'Error: Not on a LeetCode problem page',
            description: 'I couldn\'t find any LeetCode problem data. Please make sure you\'re on a LeetCode problem page and refresh the extension.'
          }));
        }
      });
    });
  };

  // Function to handle tab change with animation
  const handleTabChange = (tabName) => {
    // Add a fade-out class to the current tab
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.classList.add('tab-fade-out');
      
      // After a short delay, change the tab and remove the fade-out class
      setTimeout(() => {
        setActiveTab(tabName);
        mainElement.classList.remove('tab-fade-out');
      }, 150);
    } else {
      // If the main element isn't found, just change the tab
      setActiveTab(tabName);
    }
  };

  return (
    <div className="container">
      <Header 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
      />
      
      <main className="tab-transition">
        {activeTab === 'solution' && (
          <SolutionTab 
            problem={currentProblem} 
          />
        )}
        
        {activeTab === 'chat' && (
          <ChatTab 
            problem={currentProblem} 
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </main>
    </div>
  );
};

export default App;