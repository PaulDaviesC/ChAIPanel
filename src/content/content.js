// Function to get the main content of the page
function getPageContent() {
    // Get the page title
    const title = document.title;
    
    // Get the main content
    // Try to get the main content from common content containers
    const contentSelectors = [
        'article',
        'main',
        '[role="main"]',
        '.main-content',
        '#main-content',
        '.content',
        '#content'
    ];
    
    let content = '';
    for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            content = element.innerText;
            break;
        }
    }
    
    // If no main content container found, get body text
    if (!content) {
        content = document.body.innerText;
    }
    
    // Clean up the content
    content = content
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000); // Limit content length
    
    return {
        title,
        content,
        url: window.location.href
    };
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PAGE_CONTEXT') {
        const pageContext = getPageContent();
        sendResponse(pageContext);
    }
    return true; // Required for async sendResponse
}); 