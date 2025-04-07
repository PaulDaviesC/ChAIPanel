// Function to get the main content of the page
function getPageContent() {
    // Get the page title
    const title = document.title;
    
    // Get the main content using a more intelligent approach
    let content = '';
    
    // First try to find the most likely content container
    const contentSelectors = [
        // Common article containers
        'article',
        '.article',
        '.post',
        '.entry',
        '.content',
        '.main-content',
        '#content',
        '#main-content',
        'main',
        '[role="main"]',
        // Common content sections
        '.article-content',
        '.post-content',
        '.entry-content',
        '.story-content',
        '.article-body',
        '.post-body',
        '.entry-body',
        '.story-body'
    ];
    
    // Try each selector
    for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            // Check if this element has meaningful content
            const textContent = element.innerText.trim();
            if (textContent.length > 100) { // Ensure it has substantial content
                content = textContent;
                break;
            }
        }
    }
    
    // If no suitable container found, try a more advanced approach
    if (!content) {
        // Find the largest text block in the page
        const textBlocks = Array.from(document.querySelectorAll('div, section, article, main'))
            .filter(el => {
                // Filter out navigation, headers, footers, etc.
                const tagName = el.tagName.toLowerCase();
                const className = el.className.toLowerCase();
                const id = el.id.toLowerCase();
                
                // Skip common non-content elements
                if (tagName === 'nav' || tagName === 'header' || tagName === 'footer' || 
                    className.includes('nav') || className.includes('header') || className.includes('footer') ||
                    className.includes('menu') || className.includes('sidebar') ||
                    id.includes('nav') || id.includes('header') || id.includes('footer') ||
                    id.includes('menu') || id.includes('sidebar')) {
                    return false;
                }
                
                // Get text content
                const text = el.innerText.trim();
                return text.length > 200; // Only consider blocks with substantial text
            })
            .map(el => ({
                element: el,
                text: el.innerText.trim(),
                length: el.innerText.trim().length
            }))
            .sort((a, b) => b.length - a.length); // Sort by length, longest first
        
        // Use the longest text block if found
        if (textBlocks.length > 0) {
            content = textBlocks[0].text;
        } else {
            // Fallback to body text
            content = document.body.innerText;
        }
    }
    
    // Clean up the content
    content = content
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2800); // Limit content length
    
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