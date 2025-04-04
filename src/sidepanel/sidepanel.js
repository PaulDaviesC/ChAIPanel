document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.getElementById('chatContainer');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');

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