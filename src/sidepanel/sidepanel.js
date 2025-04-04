document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chatContainer');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');

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
          message: message
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