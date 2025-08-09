// Content script for LeetCode Gen Z AI Solver

// Initialize extension when page loads
document.addEventListener('DOMContentLoaded', initializeExtension);

// Also try to initialize when URL changes (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(initializeExtension, 1000); // Wait for DOM to update
  }
}).observe(document, { subtree: true, childList: true });

// Global listener for messages from popup
// This ensures the listener is registered even if initializeExtension hasn't completed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`Received message in content script: ${JSON.stringify(message)}. Current URL: ${window.location.href}`);
  console.log(`Current document title: ${document.title}`);
  console.log(`Is LeetCode URL: ${window.location.href.includes('leetcode.com')}`);
  
  if (message.action === 'getProblemData') {
    console.log('Extracting problem data directly for debugging');
    
    // Check if we're on a LeetCode problem page
    const isLeetCodeProblem = (
      window.location.href.includes('leetcode.com/problems/') ||
      document.title.includes('LeetCode') ||
      document.querySelector('.question-title') !== null
    );
    
    console.log(`Is LeetCode problem page: ${isLeetCodeProblem}`);
    
    if (!isLeetCodeProblem) {
      console.error('Not on a LeetCode problem page');
      sendResponse({
        title: 'Error: Not on a LeetCode problem page',
        description: 'Please navigate to a LeetCode problem page and try again.',
        language: 'JavaScript'
      });
      return true;
    }
    
    // Dump DOM structure for debugging
    console.log('Document body class:', document.body.className);
    console.log('Main content element:', document.querySelector('main'));
    
    // Force extraction from the page for debugging
    const problemData = extractProblemData();
    if (problemData && problemData.title) {
      console.log("Successfully extracted problem data:", problemData);
      sendResponse(problemData);
    } else {
      console.error("Failed to extract problem data from page");
      sendResponse({ error: "Could not extract problem data from page" });
    }
    
    return true; // Keep the message channel open for async response
  }
});

// Helper function to extract problem data
function extractProblemData() {
  console.log("Extracting problem data directly from page");
  try {
    // Get problem title - try multiple selectors
    const titleSelectors = [
      '.mr-2.text-label-1',
      'div[data-cy="question-title"]',
      '.css-v3d350',
      'div.text-title-large',
      '.mr-2.text-lg.font-medium',
      'h4.title__20p2',
      '.question-title'
    ];
    
    let titleElement = null;
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`Found title element with selector: ${selector}`);
        titleElement = element;
        break;
      }
    }
    
    const title = titleElement ? titleElement.textContent.trim() : '';
    console.log(`Extracted title: "${title}"`);
    
    if (!title) {
      console.error("Failed to find title element with any selector");
    }
    
    // Get problem description - try multiple selectors
    const descriptionSelectors = [
      'div[data-cy="question-content"] div.content__u3I1',
      '.question-content__JfgR',
      '.question-content',
      '.content__u3I1',
      '.elfjS',
      '[data-track-load="description_content"]',
      '.px-5.pt-4'
    ];
    
    let descriptionElement = null;
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`Found description element with selector: ${selector}`);
        descriptionElement = element;
        break;
      }
    }
    
    const description = descriptionElement ? descriptionElement.textContent.trim() : '';
    console.log(`Extracted description length: ${description.length}`);
    
    if (!description) {
      console.error("Failed to find description element with any selector");
    }
    
    // Get constraints and examples
    console.log("Extracting constraints and examples");
    const contentDivs = document.querySelectorAll('div[data-cy="question-content"] div.content__u3I1 p, div[data-cy="question-content"] div.content__u3I1 pre') || 
                       document.querySelectorAll('.question-content__JfgR p, .question-content__JfgR pre');
    
    console.log(`Found ${contentDivs.length} content divs for constraints/examples extraction`);
    
    let constraints = '';
    let examples = '';
    let inConstraints = false;
    let inExamples = false;
    
    contentDivs.forEach(div => {
      const text = div.textContent.trim();
      if (text.includes('Constraints:') || text.includes('Constraint:')) {
        console.log("Found constraints section:", text.substring(0, 50));
        inConstraints = true;
        inExamples = false;
        constraints += text + '\n';
      } else if (text.includes('Example') || text.match(/Example \d+:/)) {
        console.log("Found example section:", text.substring(0, 50));
        inConstraints = false;
        inExamples = true;
        examples += text + '\n';
      } else if (inConstraints) {
        constraints += text + '\n';
      } else if (inExamples) {
        examples += text + '\n';
      }
    });
    
    console.log(`Extracted constraints length: ${constraints.length}`);
    console.log(`Extracted examples length: ${examples.length}`);
    
    // Get selected language - try multiple selectors
    const languageSelectors = [
      'div[data-cy="lang-select"] .ant-select-selection-selected-value',
      '.relative.text-label-1 span',
      '.ant-select-selection-selected-value',
      '.monaco-editor .language-id',
      '.select-container .notranslate',
      '[data-cy="code-editor"] .language-id'
    ];
    
    let languageSelector = null;
    for (const selector of languageSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`Found language selector with selector: ${selector}`);
        languageSelector = element;
        break;
      }
    }
    
    const language = languageSelector ? languageSelector.innerText : 'JavaScript';
    console.log(`Extracted language: ${language}`);
    
    // Fallback: Try to determine language from editor class or attributes
    if (language === 'JavaScript' && !languageSelector) {
      console.log("Using fallback method to detect language");
      const editorElement = document.querySelector('.monaco-editor');
      if (editorElement) {
        const editorClasses = editorElement.className;
        console.log(`Editor classes: ${editorClasses}`);
      }
    }
    
    return { title, description, constraints, examples, language };
  } catch (error) {
    console.error("Error extracting problem data:", error);
    return null;
  }
}

// Initialize the extension
function initializeExtension() {
  console.log("Initializing extension on: " + location.href);
  
  // Only run on problem pages
  if (!location.href.includes('leetcode.com/problems/')) {
    console.log("Not on a LeetCode problem page, skipping initialization");
    return;
  }
  
  console.log("On a LeetCode problem page, waiting for content to load");
  // Wait for problem content to load
  setTimeout(scrapeProblemData, 1500);
}

// Scrape problem data from the page
function scrapeProblemData() {
  console.log("Scraping problem data from: " + location.href);
  
  // Debug DOM structure to help identify selectors
  console.log("Document title: " + document.title);
  console.log("Problem title elements found: " + document.querySelectorAll("div[data-cy='question-title'], .css-v3d350, div.text-title-large, .mr-2.text-lg.font-medium, h4").length);
  
  // Extract problem title - try multiple selectors for different LeetCode UI versions
  const title = document.querySelector("div[data-cy='question-title'], .css-v3d350")?.innerText || 
                document.querySelector("div.text-title-large")?.innerText ||
                document.querySelector(".mr-2.text-lg.font-medium")?.innerText ||
                document.querySelector("h4")?.innerText || "";
  
  console.log("Found title:", title);
  
  // Extract problem description - try multiple selectors for different LeetCode UI versions
  const description = document.querySelector(".question-content, .content__u3I1, .elfjS")?.innerText || 
                     document.querySelector("[data-track-load='description_content']")?.innerText ||
                     document.querySelector(".px-5.pt-4")?.innerText || "";
  
  console.log("Found description length:", description.length);
  
  // Extract constraints and examples
  let constraints = "";
  let examples = "";
  
  // Try to find constraints section using multiple approaches
  const contentDivs = document.querySelectorAll('.question-content p, .content__u3I1 p, .elfjS p, [data-track-load="description_content"] p, .px-5.pt-4 p');
  let inConstraints = false;
  let inExamples = false;
  
  contentDivs.forEach(div => {
    const text = div.innerText;
    if (text.includes('Constraints:')) {
      inConstraints = true;
      inExamples = false;
      constraints += text + "\n";
    } else if (text.includes('Example') && !text.includes('Examples:')) {
      inConstraints = false;
      inExamples = true;
      examples += text + "\n";
    } else if (inConstraints) {
      constraints += text + "\n";
    } else if (inExamples) {
      examples += text + "\n";
    }
  });
  
  // If we couldn't find constraints or examples with the above method, try another approach
  if (!constraints || !examples) {
    // Look for strong/b tags that might indicate section headers
    document.querySelectorAll('strong, b').forEach(header => {
      const text = header.innerText;
      if (text.includes('Constraints')) {
        // Get the parent element and all following siblings until the next header
        let el = header.parentElement;
        while (el && !el.querySelector('strong, b:not(:contains("Constraints"))')) {
          constraints += el.innerText + "\n";
          el = el.nextElementSibling;
        }
      } else if (text.includes('Example')) {
        // Get the parent element and all following siblings until the next header
        let el = header.parentElement;
        while (el && !el.querySelector('strong, b:not(:contains("Example"))')) {
          examples += el.innerText + "\n";
          el = el.nextElementSibling;
        }
      }
    });
  }
  
  console.log("Found constraints length:", constraints.length);
  console.log("Found examples length:", examples.length);
  
  // Get selected language from LeetCode editor - try multiple selectors
  const languageSelector = document.querySelector('div[data-cy="lang-select"] .ant-select-selection-selected-value') ||
                          document.querySelector('.relative.text-label-1 span');
  const language = languageSelector ? languageSelector.innerText : 'JavaScript';
  
  console.log("Selected language:", language);
  
  // Store the problem data in chrome.storage for the popup to access
  const problemData = { title, description, constraints, examples, language };
  chrome.storage.local.set({ currentProblem: problemData }, () => {
    console.log("Problem data stored in chrome.storage");
  });
  
  // Also send a message to the background script
  if (title && description) {
    console.log("Sending problem data to background script");
    chrome.runtime.sendMessage({
      type: "problemDetected",
      title,
      description,
      constraints,
      examples,
      language
    });
  } else {
    console.log("Could not find problem data");
  }
  
  // Add listener for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getProblemData') {
      console.log("Popup requested problem data, sending:", problemData);
      // Make sure we have data to send
      if (problemData && problemData.title) {
        sendResponse(problemData);
      } else {
        console.error("No problem data available to send");
        // Send an error response instead of null
        sendResponse({ error: "No problem data available" });
      }
    }
    return true; // Keep the message channel open for async response
  });
}

// Create and inject the extension button
function injectExtensionButton() {
  // Check if button already exists
  if (document.getElementById('leetcode-genz-solver-btn')) return;
  
  // Create button
  const button = document.createElement('button');
  button.id = 'leetcode-genz-solver-btn';
  button.innerText = '🧠';
  button.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    z-index: 9999;
    background: #3e8e41;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  
  // Add hover effect
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#45a049';
  });
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = '#3e8e41';
  });
  
  // Add click handler to open modal
  button.addEventListener('click', () => {
    toggleModal();
  });
  
  // Add to page
  document.body.appendChild(button);
}

// Create and toggle the modal
function toggleModal() {
  let modal = document.getElementById('leetcode-genz-solver-modal');
  
  // If modal exists, toggle visibility
  if (modal) {
    if (modal.style.display === 'none') {
      modal.style.display = 'block';
    } else {
      modal.style.display = 'none';
    }
    return;
  }
  
  // Create modal container
  modal = document.createElement('div');
  modal.id = 'leetcode-genz-solver-modal';
  modal.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    width: 450px;
    height: 500px;
    background: white;
    z-index: 10000;
    border-radius: 8px;
    box-shadow: 0 4px 23px 0 rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    resize: both;
    min-width: 300px;
    min-height: 400px;
    max-width: 800px;
    max-height: 800px;
  `;
  
  // Create modal header for dragging
  const header = document.createElement('div');
  header.style.cssText = `
    background-color: #1a202c;
    color: white;
    padding: 12px 16px;
    cursor: move;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  `;
  
  // Add title to header
  const title = document.createElement('div');
  title.textContent = 'LeetMate ⚡ 🧠';
  title.style.fontWeight = 'bold';
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    background: transparent;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
  `;
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Assemble header
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Create iframe to load the popup content
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('popup.html');
  iframe.style.cssText = `
    flex: 1;
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  `;
  
  // Add elements to modal
  modal.appendChild(header);
  modal.appendChild(iframe);
  
  // Add modal to page
  document.body.appendChild(modal);
  
  // Make the modal draggable
  makeDraggable(modal, header);
}

// Function to make an element draggable
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }
  
  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Call to inject button
setTimeout(injectExtensionButton, 2000);