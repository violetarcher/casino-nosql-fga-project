// --- State Management ---
let state = {
    currentUser: null,
    users: [],
    messages: [],
    isLoading: true,
    isBotTyping: false,
};

// --- DOM Elements ---
const appContainer = document.getElementById('app');

// --- Rendering Functions ---

function render() {
    appContainer.innerHTML = ''; // Clear previous content
    const mainLayout = document.createElement('div');
    mainLayout.className = 'max-w-4xl mx-auto';
    
    mainLayout.innerHTML = `
        <header class="text-center mb-8">
            <h1 class="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                Casino Chatbot with Auth0 FGA
            </h1>
            <p class="text-gray-400 mt-2">
                A demonstration of fine-grained authorization.
            </p>
        </header>
        <main id="main-content"></main>
    `;
    appContainer.appendChild(mainLayout);
    
    const mainContent = document.getElementById('main-content');

    if (state.isLoading) {
        mainContent.innerHTML = `<div class="text-center p-10">Loading...</div>`;
        return;
    }

    if (!state.currentUser) {
        renderUserSelection(mainContent);
    } else {
        renderChatbot(mainContent);
    }
}

function renderUserSelection(container) {
    const userSelectionDiv = document.createElement('div');
    userSelectionDiv.className = 'p-6 bg-gray-800 rounded-lg shadow-xl';
    
    let userButtons = state.users.map(user => `
        <button data-userid="${user.id}" class="user-select-btn w-full text-left p-4 bg-gray-700 hover:bg-indigo-600 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <p class="text-lg font-semibold text-white">Login as ${user.name}</p>
            <p class="text-sm text-gray-400">User ID: ${user.id}</p>
        </button>
    `).join('');

    userSelectionDiv.innerHTML = `
        <h2 class="text-2xl font-bold text-white mb-4">Select a User to Simulate Login</h2>
        <div class="space-y-3">${userButtons}</div>
    `;
    container.appendChild(userSelectionDiv);

    document.querySelectorAll('.user-select-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            state.currentUser = e.currentTarget.dataset.userid;
            state.messages = [{ sender: 'bot', text: `Hello! I'm the Casino Concierge. How can I help you today? Try asking about your loyalty points.` }];
            render();
        });
    });
}

function renderChatbot(container) {
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'h-[70vh]';
    
    let messagesHTML = state.messages.map(msg => {
        const isUser = msg.sender === 'user';
        const bgColor = isUser ? 'bg-indigo-600' : 'bg-gray-700';
        const align = isUser ? 'justify-end' : 'justify-start';
        return `
            <div class="flex ${align} mb-4">
                <div class="rounded-lg px-4 py-2 max-w-md ${bgColor} text-white">${msg.text}</div>
            </div>
        `;
    }).join('');

    if (state.isBotTyping) {
        messagesHTML += `
            <div class="flex justify-start mb-4">
                <div class="rounded-lg px-4 py-2 max-w-md bg-gray-700 text-white">
                    <div class="flex items-center space-x-2">
                        <span class="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span class="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span class="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>
        `;
    }

    chatbotContainer.innerHTML = `
        <div class="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div class="p-4 bg-gray-900 text-white font-bold border-b border-gray-700">
                Casino Concierge Chat (Logged in as: ${state.currentUser})
            </div>
            <div id="chat-messages" class="flex-1 p-6 overflow-y-auto">${messagesHTML}</div>
            <div class="p-4 bg-gray-900 border-t border-gray-700">
                <div class="flex items-center space-x-2">
                    <input id="chat-input" type="text" class="flex-1 bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ask about your profile...">
                    <button id="send-btn" class="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </div>
        </div>
        <button id="logout-btn" class="mt-4 w-full text-center p-3 bg-gray-700 hover:bg-red-600 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500">
            Logout
        </button>
    `;
    container.appendChild(chatbotContainer);
    
    scrollToBottom();

    // Event Listeners
    document.getElementById('send-btn').addEventListener('click', handleSend);
    document.getElementById('chat-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSend();
    });
    document.getElementById('logout-btn').addEventListener('click', () => {
        state.currentUser = null;
        state.messages = [];
        render();
    });
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    if(chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// --- Logic ---
async function handleSend() {
    const input = document.getElementById('chat-input');
    const query = input.value.trim();
    if (query === '') return;

    state.messages.push({ sender: 'user', text: query });
    input.value = '';
    render();

    state.isBotTyping = true;
    render();

    await new Promise(res => setTimeout(res, 500));
    await processUserQuery(query);

    state.isBotTyping = false;
    render();
}

async function processUserQuery(query) {
    const lowerCaseQuery = query.toLowerCase();
    let targetUserId = state.currentUser;
    let botResponse = "";

    if (lowerCaseQuery.includes('points') || lowerCaseQuery.includes('balance')) {
        if (lowerCaseQuery.includes('alice')) targetUserId = 'user_123';
        else if (lowerCaseQuery.includes('bob')) targetUserId = 'user_456';
        else if (lowerCaseQuery.includes('cathy')) targetUserId = 'user_789';
        
        try {
            const response = await fetch(`/api/profile/${targetUserId}?currentUserId=${state.currentUser}`);
            const data = await response.json();

            if (!response.ok) {
                botResponse = data.error || 'An unknown error occurred.';
            } else {
                 botResponse = `Here is the profile for ${data.name}:<br>
                               <strong>Loyalty Points:</strong> ${data.loyaltyPoints}<br>
                               <strong>Tier:</strong> ${data.tier}<br>
                               <strong>Last Visit:</strong> ${data.lastVisit}`;
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            botResponse = "Could not connect to the server to get profile information.";
        }

    } else {
        botResponse = "I can help with questions about loyalty points and user profiles.";
    }

    state.messages.push({ sender: 'bot', text: botResponse });
}

// --- App Initialization ---
async function init() {
    render(); // Initial render for loading state
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to fetch users');
        }
        state.users = await response.json();
    } catch (error) {
        console.error("Failed to fetch users:", error);
        appContainer.innerHTML = `<div class="text-center p-10 text-red-400">Failed to load user data from the server. Is the server running and are FGA credentials correct?</div>`;
    }
    state.isLoading = false;
    render();
}

init();