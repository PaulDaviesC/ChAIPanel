// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('ChatGPT Quick Chat extension installed/updated');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_CHAT') {
    // Handle opening chat functionality
    console.log('Opening chat...');
  } else if (message.type === 'SEND_MESSAGE') {
    // Handle sending messages
    console.log('Received message:', message.message);
    
    // Get API key from storage
    chrome.storage.local.get(['openaiApiKey'], (result) => {
      if (!result.openaiApiKey) {
        chrome.runtime.sendMessage({
          type: 'RECEIVE_MESSAGE',
          text: 'Please set your OpenAI API key in the extension settings.'
        });
        return;
      }

      // Send message to ChatGPT API
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: message.message
          }]
        })
      })
      .then(response => response.json())
      .then(data => {
        const reply = data.choices[0].message.content;
        chrome.runtime.sendMessage({
          type: 'RECEIVE_MESSAGE',
          text: reply
        });
      })
      .catch(error => {
        console.error('Error:', error);
        chrome.runtime.sendMessage({
          type: 'RECEIVE_MESSAGE',
          text: 'Sorry, there was an error processing your message.'
        });
      });
    });
  } else if (message.type === 'SET_API_KEY') {
    // Store the API key
    chrome.storage.local.set({ openaiApiKey: message.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
}); 