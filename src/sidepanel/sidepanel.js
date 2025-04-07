document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chatContainer');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const getContextButton = document.getElementById('getContextButton');
  const contextCheckbox = document.getElementById('contextCheckbox');

  // Check for API key on load
  chrome.storage.local.get(['openaiApiKey'], (result) => {
    if (!result.openaiApiKey) {
      const setupMessage = document.createElement('div');
      setupMessage.className = 'message assistant-message';
      setupMessage.innerHTML = `
        <p>Welcome to ChAIPanel! To get started, you need to add your OpenAI API key to the extension.</p>
        <p>Here's how to add your key:</p>
        <ol style="margin: 8px 0; padding-left: 20px;">
          <li>Click the "Open Settings" button below</li>
          <li>In the settings page, paste your OpenAI API key in the input field</li>
          <li>Click the "Save" button</li>
          <li>Return to this panel and start chatting!</li>
        </ol>
        <p style="color: #666; font-size: 0.9em; margin-top: 8px;">
          Note: Your API key is stored securely in your browser's local storage and is never sent anywhere except to OpenAI's servers.
        </p>
        <button id="openSettings" style="
          margin-top: 8px;
          padding: 8px 16px;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">Open Settings</button>
      `;
      chatContainer.appendChild(setupMessage);

      // Add click handler for settings button
      document.getElementById('openSettings').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });

      // Disable input until API key is set
      messageInput.disabled = true;
      sendButton.disabled = true;
    }
  });

  // Function to create loading indicator
  function createLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'loading-dot';
      loadingDiv.appendChild(dot);
    }
    return loadingDiv;
  }

  // Function to add a message to the chat
  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Function to add context message
  function addContextMessage(context) {
    const contextDiv = document.createElement('div');
    contextDiv.className = 'context-message';
    contextDiv.innerHTML = `
      <h3>Page Context</h3>
      <p><strong>Title:</strong> ${context.title}</p>
      <p><strong>URL:</strong> ${context.url}</p>
      <p><strong>Content:</strong> ${context.content}</p>
    `;
    chatContainer.appendChild(contextDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Handle sending messages
  async function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      // Add user message
      addMessage(message, true);
      messageInput.value = '';
      
      // Disable input and show loading
      messageInput.disabled = true;
      sendButton.disabled = true;
      const loadingIndicator = createLoadingIndicator();
      chatContainer.appendChild(loadingIndicator);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      try {
        // Send message to background script
        await chrome.runtime.sendMessage({
          type: 'SEND_MESSAGE',
          message: message,
          includeContext: contextCheckbox.checked
        });
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage('Sorry, there was an error sending your message. Please try again.', false);
      } finally {
        // Remove loading indicator and re-enable input
        loadingIndicator.remove();
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
      }
    }
  }

  // Handle getting page context
  getContextButton.addEventListener('click', async () => {
    // Show loading state
    getContextButton.disabled = true;
    getContextButton.textContent = 'Loading...';
    
    try {
      const response = await chrome.runtime.sendMessage({type: 'GET_TAB_CONTEXT'});
      if (response.error) {
        addMessage('Failed to get page context: ' + response.error, false);
        
        // Add helpful message based on error
        if (response.error.includes('browser internal pages')) {
          addMessage('Content scripts cannot run on browser internal pages like chrome://, about:, or extension pages.', false);
        } else if (response.error.includes('No active tab found')) {
          addMessage('No active tab was found. Please make sure you have a webpage open.', false);
        }
      } else {
        addContextMessage(response);
      }
    } catch (error) {
      console.error('Error getting tab context:', error);
      addMessage('Failed to get page context. Please try again.', false);
    } finally {
      // Reset button state
      getContextButton.disabled = false;
      getContextButton.textContent = 'Get Page Context';
    }
  });

  // Event listeners
  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'RECEIVE_MESSAGE') {
      addMessage(message.text);
    }
  });

  // Focus input on load
  messageInput.focus();
}); 