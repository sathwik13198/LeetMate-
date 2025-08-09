// Background script for LeetCode Gen Z AI Solver

// Store API key
let apiKey = "";

// Retrieve API key from storage
chrome.storage.local.get(["geminiApiKey"], (result) => {
  if (result.geminiApiKey) apiKey = result.geminiApiKey;
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "solveProblem") {
    handleProblemSolving(message, sendResponse);
    return true; // Indicates async response

  } else if (message.type === "askQuestion") {
    handleCustomQuestion(message, sendResponse);
    return true; // Indicates async response

  } else if (message.type === "problemDetected") {
    // Forward problem data to popup if it's open
    chrome.runtime.sendMessage({
      action: "problemDetected",
      title: message.title,
      description: message.description,
      constraints: message.constraints,
      examples: message.examples,
      language: message.language
    });

    // Store for later use
    chrome.storage.local.set({
      currentProblem: {
        title: message.title,
        description: message.description,
        constraints: message.constraints,
        examples: message.examples,
        language: message.language
      }
    });

    return true;

  } else if (message.type === "openExtensionPage") {
    // Open extension in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    return true;

  } else if (message.type === "openPopup") {
    // Open popup.html in a small Chrome popup window
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 400,
      height: 600
    });
    return true;
  }
});

// Handle problem solving request
async function handleProblemSolving(message, sendResponse) {
  if (!apiKey) {
    sendResponse({
      error: "No API key found. Please set your Gemini 2.0 Flash API key in the extension settings."
    });
    return;
  }

  const language = message.language || "JavaScript";

  const prompt = `Yo bestie 🫡, here's the LeetCode problem: 
Title: ${message.title} 
Description: ${message.description}
Constraints: ${message.constraints || "Not specified"}
Examples: ${message.examples || "Not specified"}

Give me: 
1. A short Gen Z-style explanation with emojis and slang. Keep it casual and fun.
2. The code in ${language} with syntax highlighting-ready formatting.
3. A brief explanation of the time and space complexity.

Make sure your response is formatted in a way that I can easily extract the code section.`;

  try {
    const response = await callGeminiAPI(prompt);
    sendResponse({ data: response });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Handle custom question
async function handleCustomQuestion(message, sendResponse) {
  if (!apiKey) {
    sendResponse({
      error: "No API key found. Please set your Gemini 2.0 Flash API key in the extension settings."
    });
    return;
  }

  const prompt = `Yo bestie 🫡, I'm working on this LeetCode problem: 
Title: ${message.title} 
Description: ${message.description}

Here's my question: ${message.question}

Give me a Gen Z-style response with emojis and slang. Keep it casual and fun.`;

  try {
    const response = await callGeminiAPI(prompt);
    sendResponse({ data: response });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Call Gemini 2.0 Flash API
async function callGeminiAPI(prompt) {
  if (!apiKey) {
    throw new Error("No API key found. Please set your Gemini 2.0 Flash API key in the extension settings.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    console.log('Calling Gemini 2.0 Flash API with prompt:', prompt.substring(0, 100) + '...');

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini 2.0 Flash API error:', errorData);
      throw new Error(errorData.error?.message || "Failed to call Gemini 2.0 Flash API");
    }

    const data = await response.json();
    console.log('Gemini 2.0 Flash API response received');
    return data;

  } catch (error) {
    console.error('Error calling Gemini 2.0 Flash API:', error);
    throw error;
  }
}
