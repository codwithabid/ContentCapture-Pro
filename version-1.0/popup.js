document.getElementById('copyButton').addEventListener('click', function () {
    const selectedContent = document.getElementById('contentType').value;
  
    // Ensure we're querying the active tab properly
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Ensure tabs[0] exists before trying to inject the script
      if (tabs[0]) {
        // Inject script to extract content using chrome.scripting.executeScript
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: getContent,
          args: [selectedContent],
        }, (result) => {
          // Handle the result returned by the injected function
          const content = result[0]?.result || "No content found.";
          const textArea = document.getElementById('contentText');
          textArea.value = content;
  
          // Copy content to clipboard using modern Clipboard API
          navigator.clipboard.writeText(content)
            .then(() => {
              document.getElementById('status').textContent = 'Content copied to clipboard!';
            })
            .catch(err => {
              document.getElementById('status').textContent = 'Failed to copy: ' + err;
              console.error('Could not copy text: ', err);
            });
        });
      }
    });
  });
  
  // Function to get the content based on selected type
  function getContent(type) {
    if (type === 'article') {
      // Try multiple selectors that might contain article content
      const articleSelectors = [
        'article',
        'main',
        '.main-content',
        '#content',
        '.post-content',
        '.entry-content'
      ];
      
      for (const selector of articleSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.innerText;
        }
      }
      return "No article content found";
    } else if (type === 'headers') {
      let headers = [];
      let headerTags = document.querySelectorAll("h1, h2, h3");
      headerTags.forEach(tag => headers.push(tag.innerText));
      return headers.join("\n");
    } else if (type === 'links') {
      let links = [];
      let anchorTags = document.querySelectorAll("a");
      anchorTags.forEach(anchor => {
        if (anchor.href && anchor.href.startsWith('http')) {
          links.push(anchor.href);
        }
      });
      return links.join("\n");
    } else {
      return document.body.innerText; // Default to full page text
    }
  }
  