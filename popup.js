// Popup script for LeetCode Gen Z AI Solver

// DOM Elements
const solutionTab = document.getElementById('solutionTab');
const chatTab = document.getElementById('chatTab');
const settingsTab = document.getElementById('settingsTab');
const solutionContent = document.getElementById('solutionContent');
const chatContent = document.getElementById('chatContent');
const settingsContent = document.getElementById('settingsContent');
const problemTitle = document.getElementById('problemTitle');
const languageSelect = document.getElementById('languageSelect');
const refreshSolution = document.getElementById('refreshSolution');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const explanation = document.getElementById('explanation');
const codeBlock = document.getElementById('codeBlock');
const codeContainer = document.getElementById('codeContainer');
const copyBtn = document.getElementById('copyBtn');
const complexity = document.getElementById('complexity');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const promptBtns = document.querySelectorAll('.prompt-btn');
const apiKeyInput = document.getElementById('apiKeyInput');
const showApiKey = document.getElementById('showApiKey');
const saveApiKey = document.getElementById('saveApiKey');
const apiKeySaved = document.getElementById('apiKeySaved');

// State variables
let currentProblem = {
  title: '',
  description: '',
  constraints: '',
  examples: ''
};
let currentCode = '';

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Load API key from storage
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });

  // Set up tab navigation
  setupTabs();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check if we have a problem to solve
  checkForProblem();
});

// Set up tab navigation
function setupTabs() {
  solutionTab.addEventListener('click', () => switchTab('solution'));
  chatTab.addEventListener('click', () => switchTab('chat'));
  settingsTab.addEventListener('click', () => switchTab('settings'));
}

// Switch between tabs
function switchTab(tab) {
  // Remove active class from all tabs and content
  [solutionTab, chatTab, settingsTab].forEach(t => t.classList.remove('active'));
  [solutionContent, chatContent, settingsContent].forEach(c => c.classList.remove('active'));
  
  // Add active class to selected tab and content
  if (tab === 'solution') {
    solutionTab.classList.add('active');
    solutionContent.classList.add('active');
  } else if (tab === 'chat') {
    chatTab.classList.add('active');
    chatContent.classList.add('active');
  } else if (tab === 'settings') {
    settingsTab.classList.add('active');
    settingsContent.classList.add('active');
  }
}

// Set up event listeners
function setupEventListeners() {
  // Copy button
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentCode);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
  });
  
  // Refresh solution button
  refreshSolution.addEventListener('click', () => {
    generateSolution();
  });
  
  // Language select
  languageSelect.addEventListener('change', () => {
    generateSolution();
  });
  
  // Send chat message button
  sendBtn.addEventListener('click', sendChatMessage);
  
  // Chat input enter key
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
  
  // Quick prompt buttons
  promptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      chatInput.value = btn.textContent;
      sendChatMessage();
    });
  });
  
  // Show/hide API key
  showApiKey.addEventListener('mousedown', () => {
    apiKeyInput.type = 'text';
  });
  showApiKey.addEventListener('mouseup', () => {
    apiKeyInput.type = 'password';
  });
  showApiKey.addEventListener('mouseleave', () => {
    apiKeyInput.type = 'password';
  });
  
  // Save API key
  saveApiKey.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
        apiKeySaved.style.display = 'block';
        setTimeout(() => { apiKeySaved.style.display = 'none'; }, 3000);
      });
    }
  });
}

// Check if we have a problem to solve
function checkForProblem() {
  // First try to get problem data from storage
  chrome.storage.local.get(['currentProblem'], (result) => {
    if (result.currentProblem && result.currentProblem.title) {
      console.log('Found problem data in storage:', result.currentProblem.title);
      // Store problem data
      currentProblem = result.currentProblem;
      
      // Update UI
      problemTitle.textContent = currentProblem.title;
      
      // Generate solution
      generateSolution();
      return;
    }
    
    // If not in storage, query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      // Check if we're on a LeetCode problem page
      if (activeTab.url.includes('leetcode.com/problems/')) {
        console.log('On LeetCode problem page, requesting data from content script');
        // Send message to content script to get problem data
        chrome.tabs.sendMessage(activeTab.id, { action: 'getProblemData' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message to content script:', chrome.runtime.lastError);
            problemTitle.textContent = 'Could not detect problem';
            errorMessage.textContent = 'Unable to detect LeetCode problem. Please refresh the page and try again.';
            errorMessage.style.display = 'block';
            // Try to use default problem as fallback
            tryUseDefaultProblem();
            return;
          }
          
          if (response && response.title) {
            console.log('Received problem data from content script:', response.title);
            // Store problem data
            currentProblem = {
              title: response.title,
              description: response.description,
              constraints: response.constraints,
              examples: response.examples,
              language: response.language || languageSelect.value
            };
            
            // Save to storage
            chrome.storage.local.set({ currentProblem });
            
            // Update UI
            problemTitle.textContent = currentProblem.title;
            
            // Update language select if available
            if (response.language && languageSelect) {
              for (let i = 0; i < languageSelect.options.length; i++) {
                if (languageSelect.options[i].value.toLowerCase() === response.language.toLowerCase()) {
                  languageSelect.selectedIndex = i;
                  break;
                }
              }
            }
            
            // Generate solution
            generateSolution();
          } else {
            console.log('No problem data received from content script');
            problemTitle.textContent = 'Could not detect problem';
            errorMessage.textContent = 'Unable to detect LeetCode problem. Please refresh the page and try again.';
            errorMessage.style.display = 'block';
            // Try to use default problem as fallback
            tryUseDefaultProblem();
          }
        });
      } else {
        console.log('Not on a LeetCode problem page');
        problemTitle.textContent = 'Not a LeetCode problem page';
        errorMessage.textContent = 'Please navigate to a LeetCode problem page to use this extension.';
        errorMessage.style.display = 'block';
        // Try to use default problem as fallback
        tryUseDefaultProblem();
      }
    });
  });
}

// Try to use a default problem as fallback
function tryUseDefaultProblem() {
  console.log('Trying to use default problem as fallback');
  // Only use default if we don't have any problem data
  if (!currentProblem.title) {
    currentProblem = {
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
      examples: "Example 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\nExample 2:\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\nExample 3:\nInput: nums = [3,3], target = 6\nOutput: [0,1]"
    };
    
    // Update UI
    problemTitle.textContent = currentProblem.title + " (Default)";
    
    // Generate solution
    generateSolution();
  }
}

// Generate solution using Gemini API
function generateSolution() {
  // Check if we have a problem to solve
  if (!currentProblem.title) return;
  
  // Show loading indicator
  loadingIndicator.style.display = 'flex';
  errorMessage.style.display = 'none';
  explanation.style.display = 'none';
  codeContainer.style.display = 'none';
  complexity.style.display = 'none';
  
  // Get selected language
  const language = languageSelect.value;
  
  // Send message to background script to solve problem
  chrome.runtime.sendMessage({
    type: 'solveProblem',
    title: currentProblem.title,
    description: currentProblem.description,
    constraints: currentProblem.constraints,
    examples: currentProblem.examples,
    language: language
  }, (response) => {
    // Hide loading indicator
    loadingIndicator.style.display = 'none';
    
    if (response.error) {
      // Show error message
      errorMessage.textContent = response.error;
      errorMessage.style.display = 'block';
      return;
    }
    
    if (response.data && response.data.candidates && response.data.candidates[0].content) {
      // Parse response
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      parseAIResponse(aiResponse, language);
    } else {
      // Show error message
      errorMessage.textContent = 'Invalid response from Gemini API. Please try again.';
      errorMessage.style.display = 'block';
    }
  });
}

// Parse AI response to extract explanation, code, and complexity
function parseAIResponse(response, language) {
  console.log('Parsing AI response');
  
  // Split response by code blocks
  const codeBlockRegex = /```([\w]*)\n?([\s\S]*?)```/g;
  const codeBlocks = [];
  let match;
  
  while ((match = codeBlockRegex.exec(response)) !== null) {
    const lang = match[1].trim();
    const code = match[2].trim();
    codeBlocks.push({ lang, code });
  }
  
  console.log(`Found ${codeBlocks.length} code blocks`);
  
  // Extract code (should be the first or second code block)
  let code = '';
  if (codeBlocks.length > 0) {
    // Try to find a code block with the matching language
    const matchingLangBlock = codeBlocks.find(block => 
      block.lang.toLowerCase() === language.toLowerCase() ||
      (language.toLowerCase() === 'javascript' && block.lang.toLowerCase() === 'js') ||
      (language.toLowerCase() === 'python' && block.lang.toLowerCase() === 'py')
    );
    
    if (matchingLangBlock) {
      code = matchingLangBlock.code;
    } else if (codeBlocks[0].lang && codeBlocks[0].lang.length > 0) {
      // If no matching language but first block has a language
      code = codeBlocks[0].code;
    } else if (codeBlocks.length > 1 && codeBlocks[1].code) {
      // If no language in first block, try second block
      code = codeBlocks[1].code;
    } else {
      // Fallback to first block
      code = codeBlocks[0].code;
    }
  }
  
  // Store current code
  currentCode = code.trim();
  console.log('Extracted code length:', currentCode.length);
  
  // Split response by sections
  const sections = response.split('```');
  
  // Extract explanation (should be before the first code block)
  let explanationText = sections[0].trim();
  
  // Extract complexity (should be after the code block)
  let complexityText = '';
  if (sections.length > 2) {
    complexityText = sections[sections.length - 1].trim();
    
    // If complexity section is too long, it might not be the complexity section
    // Try to find a section that mentions complexity
    if (complexityText.length > 500) {
      for (let i = 1; i < sections.length; i += 2) {
        const section = sections[i + 1];
        if (section && (section.toLowerCase().includes('complexity') || 
                       section.toLowerCase().includes('time complexity') || 
                       section.toLowerCase().includes('space complexity'))) {
          complexityText = section.trim();
          break;
        }
      }
    }
  }
  
  console.log('Explanation length:', explanationText.length);
  console.log('Complexity length:', complexityText.length);
  
  // Format the explanation with proper HTML
  explanationText = formatTextWithHTML(explanationText);
  complexityText = formatTextWithHTML(complexityText);
  
  // Update UI
  explanation.innerHTML = explanationText;
  explanation.style.display = 'block';
  
  if (currentCode) {
    codeBlock.textContent = currentCode;
    codeBlock.className = `language-${language.toLowerCase()}`;
    if (typeof Prism !== 'undefined') {
      Prism.highlightElement(codeBlock);
    }
    codeContainer.style.display = 'block';
  } else {
    codeContainer.style.display = 'none';
  }
  
  if (complexityText) {
    complexity.innerHTML = complexityText;
    complexity.style.display = 'block';
  } else {
    complexity.style.display = 'none';
  }
}

// Format text with HTML for better readability
function formatTextWithHTML(text) {
  if (!text) return '';
  
  // Convert line breaks to <br>
  text = text.replace(/\n/g, '<br>');
  
  // Bold important terms
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Format lists
  text = text.replace(/^\s*[-*]\s+(.*)/gm, '<li>$1</li>');
  text = text.replace(/<\/li><br><li>/g, '</li><li>');
  text = text.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
  
  // Format headings
  text = text.replace(/^\s*#{3}\s+(.*)/gm, '<h3>$1</h3>');
  text = text.replace(/^\s*#{2}\s+(.*)/gm, '<h2>$1</h2>');
  text = text.replace(/^\s*#{1}\s+(.*)/gm, '<h1>$1</h1>');
  
  return text;
}

// Send chat message
function sendChatMessage() {
  const question = chatInput.value.trim();
  if (!question) return;
  
  // Add user message to chat
  addChatMessage('user', question);
  
  // Clear input
  chatInput.value = '';
  
  // Show loading message
  const loadingId = addChatMessage('ai', 'Thinking... 🤔');
  
  // Send message to background script
  chrome.runtime.sendMessage({
    type: 'askQuestion',
    title: currentProblem.title,
    description: currentProblem.description,
    question: question
  }, (response) => {
    // Remove loading message
    document.getElementById(loadingId).remove();
    
    if (response.error) {
      // Show error message
      addChatMessage('ai', `Error: ${response.error}`);
      return;
    }
    
    if (response.data && response.data.candidates && response.data.candidates[0].content) {
      // Add AI response to chat
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      addChatMessage('ai', aiResponse);
    } else {
      // Show error message
      addChatMessage('ai', 'Sorry, I had trouble processing that. Please try again.');
    }
  });
}

// Add message to chat
function addChatMessage(sender, message) {
  const messageId = 'msg-' + Date.now();
  const messageElement = document.createElement('div');
  messageElement.id = messageId;
  messageElement.className = `chat-message ${sender}-message`;
  
  // Format message with markdown-like syntax
  let formattedMessage = message;
  
  // Replace code blocks
  formattedMessage = formattedMessage.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Replace inline code
  formattedMessage = formattedMessage.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  messageElement.innerHTML = formattedMessage;
  chatMessages.appendChild(messageElement);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return messageId;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'problemDetected') {
    // Update problem data
    currentProblem = {
      title: message.title,
      description: message.description,
      constraints: message.constraints,
      examples: message.examples
    };
    
    // Update UI
    problemTitle.textContent = currentProblem.title;
    
    // Generate solution
    generateSolution();
  }
  
  // Always return true to indicate async response
  return true;
});