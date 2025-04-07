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
    chrome.storage.local.get(['openaiApiKey'], async (result) => {
      if (!result.openaiApiKey) {
        chrome.runtime.sendMessage({
          type: 'RECEIVE_MESSAGE',
          text: 'Please set your OpenAI API key in the extension settings.'
        });
        return;
      }

      // Get page context if available
      let pageContext = null;
      if (message.includeContext) {
        try {
          const tabs = await chrome.tabs.query({active: true, currentWindow: true});
          if (tabs[0] && !tabs[0].url.startsWith('chrome://') && 
              !tabs[0].url.startsWith('edge://') && 
              !tabs[0].url.startsWith('about:') && 
              !tabs[0].url.startsWith('chrome-extension://')) {
            
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['src/content/content.js']
              });
            } catch (e) {
              // Script might already be injected, which is fine
              console.log('Script injection result:', e);
            }
            
            pageContext = await chrome.tabs.sendMessage(tabs[0].id, {type: 'GET_PAGE_CONTEXT'});
          }
        } catch (error) {
          console.error('Error getting page context:', error);
        }
      }

      // Prepare messages array
      const messages = [];
      
      // Add system message with context if available
      if (pageContext) {
        messages.push({
          role: "system",
          content: `You are a helpful AI assistant. The user is currently viewing a webpage with the following context:
Title: ${pageContext.title}
URL: ${pageContext.url}
Content: ${pageContext.content}

Please use this context to provide more relevant responses to the user's questions about this webpage.`
        });
      }
      
      // Add user message
      messages.push({
        role: "user",
        content: message.message
      });

      // Send message to ChatGPT API
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: messages
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
  } else if (message.type === 'GET_TAB_CONTEXT') {
    // Get the active tab
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
      if (tabs[0]) {
        try {
          // Check if we can inject the content script
          if (tabs[0].url.startsWith('chrome://') || tabs[0].url.startsWith('edge://') || 
              tabs[0].url.startsWith('about:') || tabs[0].url.startsWith('chrome-extension://')) {
            sendResponse({error: 'Cannot access this page. Content scripts cannot run on browser internal pages.'});
            return;
          }
          
          // Try to execute the content script first to ensure it's loaded
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['src/content/content.js']
            });
          } catch (e) {
            // Script might already be injected, which is fine
            console.log('Script injection result:', e);
          }
          
          // Now try to get the page context
          const response = await chrome.tabs.sendMessage(tabs[0].id, {type: 'GET_PAGE_CONTEXT'});
          sendResponse(response);
        } catch (error) {
          console.error('Error getting tab context:', error);
          sendResponse({error: 'Failed to get page context: ' + error.message});
        }
      } else {
        sendResponse({error: 'No active tab found'});
      }
    });
    return true; // Required for async sendResponse
  } else if (message.type === 'SET_API_KEY') {
    // Store the API key
    chrome.storage.local.set({ openaiApiKey: message.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    // Get the current window
    chrome.windows.getCurrent((window) => {
      // Check if the side panel is open
      chrome.sidePanel.getOptions({ windowId: window.id }, (options) => {
        if (options && options.enabled) {
          // If panel is open, close it
          chrome.sidePanel.setOptions({ windowId: window.id, enabled: false });
        } else {
          // If panel is closed, open it
          chrome.sidePanel.open({ windowId: window.id });
        }
      });
    });
  }
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
}); 