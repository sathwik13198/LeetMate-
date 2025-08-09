// Options script for LeetCode Gen Z Solver

// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const showApiKeyBtn = document.getElementById('showApiKey');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

// Load saved API key when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Load API key from storage
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });
  
  // Set up event listeners
  setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
  // Show/hide API key
  showApiKeyBtn.addEventListener('mousedown', () => {
    apiKeyInput.type = 'text';
  });
  
  showApiKeyBtn.addEventListener('mouseup', () => {
    apiKeyInput.type = 'password';
  });
  
  showApiKeyBtn.addEventListener('mouseleave', () => {
    apiKeyInput.type = 'password';
  });
  
  // Save API key
  saveBtn.addEventListener('click', saveApiKey);
}

// Save API key to storage
function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showSaveStatus('error', 'Please enter a valid API key');
    return;
  }
  
  // Validate API key format (basic check)
  if (!apiKey.startsWith('AI') && apiKey.length < 10) {
    showSaveStatus('error', 'API key format appears invalid. Please check your key.');
    return;
  }
  
  // Save to storage
  chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
    showSaveStatus('success', 'API key saved successfully! ✅');
  });
}

// Show save status message
function showSaveStatus(type, message) {
  saveStatus.textContent = message;
  saveStatus.className = 'save-status ' + type;
  
  // Hide after 3 seconds
  setTimeout(() => {
    saveStatus.className = 'save-status';
  }, 3000);
}