// AI Chatbot Functions
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    addMessage('Typing...', 'bot', true);
    
    try {
        // Call AI API (using free Gemini API or OpenAI)
        const response = await getAIResponse(message);
        removeTypingIndicator();
        addMessage(response, 'bot');
    } catch (error) {
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

function addMessage(text, sender, isTyping = false) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    if (isTyping) messageDiv.id = 'typing-indicator';
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// AI Response Generator (Mock - Replace with actual API)
async function getAIResponse(message) {
    // This is a mock response. Replace with actual API call
    const responses = {
        'hello': 'Hello! How can I assist you today?',
        'help': 'I can help with code, image generation, text summarization, and more!',
        'code': 'Share your code and I will analyze it for bugs and improvements.',
        'default': `I understand you're asking about "${message}". As your AI assistant, I can help you with:
- Code debugging and optimization
- Image generation from text
- Text summarization
- Technical questions
- Product recommendations

How can I assist you specifically?`
    };
    
    const lowerMsg = message.toLowerCase();
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMsg.includes(key)) {
            return value;
        }
    }
    return responses.default;
}

// Image Generation
async function generateImage() {
    const prompt = prompt("Describe the image you want to generate:");
    if (!prompt) return;
    
    addMessage(`Generating image: "${prompt}"`, 'bot');
    
    try {
        // Using free placeholder API - Replace with actual AI image API
        const imageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
        
        const imageDiv = document.createElement('div');
        imageDiv.className = 'bot-message';
        imageDiv.innerHTML = `<img src="${imageUrl}" alt="Generated Image" style="max-width: 100%; border-radius: 10px;"><br><small>Generated: ${prompt}</small>`;
        document.getElementById('chat-messages').appendChild(imageDiv);
    } catch (error) {
        addMessage('Failed to generate image. Please try again.', 'bot');
    }
}

// Text Summarization
async function summarizeText() {
    const text = prompt("Enter text to summarize:");
    if (!text) return;
    
    addMessage(`Summarizing: "${text.substring(0, 100)}..."`, 'bot');
    
    // Mock summarization
    const summary = text.length > 100 ? text.substring(0, 100) + "..." : text;
    addMessage(`Summary: ${summary}`, 'bot');
}

// Code Analysis
async function analyzeCode() {
    const code = prompt("Paste your code here for analysis:");
    if (!code) return;
    
    addMessage(`Analyzing code...`, 'bot');
    
    // Mock code analysis
    let analysis = "Code Analysis:\n";
    if (code.includes('console.log')) analysis += "✓ Uses console.log for debugging\n";
    if (code.includes('function')) analysis += "✓ Contains functions\n";
    if (code.includes('var ')) analysis += "⚠️ Consider using let/const instead of var\n";
    if (code.length > 500) analysis += "⚠️ Code is long. Consider breaking into smaller functions\n";
    
    addMessage(analysis, 'bot');
}

// Real-time Analytics
function trackEvent(eventName, eventData) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Store in Firestore
    if (firebase.auth().currentUser) {
        firebase.firestore().collection('events').add({
            event: eventName,
            data: eventData,
            userId: firebase.auth().currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}

// Live Visitor Counter
let visitorCount = 0;
function updateLiveVisitorCount() {
    visitorCount++;
    const visitorElement = document.getElementById('visitors');
    if (visitorElement) {
        visitorElement.innerText = visitorCount;
    }
    
    // Update every 30 seconds
    setTimeout(() => {
        visitorCount--;
        if (visitorElement) visitorElement.innerText = visitorCount;
    }, 30000);
}

updateLiveVisitorCount();

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    trackPageView(window.location.pathname);
    
    // Load user count
    if (firebase.auth().currentUser) {
        firebase.firestore().collection('users').get().then(snapshot => {
            document.getElementById('users').innerText = snapshot.size;
        });
    }
    
    // Load sales data
    firebase.firestore().collection('orders').get().then(snapshot => {
        let total = 0;
        snapshot.forEach(doc => {
            total += doc.data().amount || 0;
        });
        document.getElementById('sales').innerText = total;
    });
});
