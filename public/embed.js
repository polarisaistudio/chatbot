/**
 * Polaris AI Support - Embeddable Widget Script
 *
 * Usage:
 * <script src="https://your-domain.com/embed.js" data-polaris-id="your-id"></script>
 */

(function () {
  // Configuration
  const scriptTag = document.currentScript;
  const polarisId = scriptTag?.getAttribute('data-polaris-id');
  const apiUrl = scriptTag?.getAttribute('data-api-url') || window.location.origin;

  // Widget state
  let isOpen = false;
  let sessionId = null;
  let messages = [];

  // Create widget HTML
  function createWidget() {
    const widgetHTML = `
      <div id="polaris-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: system-ui, -apple-system, sans-serif;">
        <!-- Toggle Button -->
        <button id="polaris-toggle" style="
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-center;
          transition: transform 0.2s;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>

        <!-- Chat Window -->
        <div id="polaris-chat" style="
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
        ">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Polaris AI Support</h3>
              <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Ask me anything</p>
            </div>
            <button id="polaris-close" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 24px; line-height: 1; padding: 0;">&times;</button>
          </div>

          <!-- Messages -->
          <div id="polaris-messages" style="
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #f7fafc;
          "></div>

          <!-- Input -->
          <div style="padding: 16px; border-top: 1px solid #e2e8f0; background: white;">
            <div style="display: flex; gap: 8px;">
              <input
                id="polaris-input"
                type="text"
                placeholder="Type your message..."
                style="
                  flex: 1;
                  padding: 10px 12px;
                  border: 1px solid #cbd5e0;
                  border-radius: 8px;
                  font-size: 14px;
                  outline: none;
                "
              />
              <button id="polaris-send" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 10px 16px;
                cursor: pointer;
                font-weight: 500;
              ">Send</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    attachEventListeners();
    addMessage('assistant', 'Hi! How can I help you today?');
  }

  // Attach event listeners
  function attachEventListeners() {
    const toggle = document.getElementById('polaris-toggle');
    const close = document.getElementById('polaris-close');
    const send = document.getElementById('polaris-send');
    const input = document.getElementById('polaris-input');

    toggle.addEventListener('click', toggleChat);
    close.addEventListener('click', toggleChat);
    send.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Hover effect for toggle button
    toggle.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.05)';
    });
    toggle.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  }

  // Toggle chat window
  function toggleChat() {
    const chat = document.getElementById('polaris-chat');
    isOpen = !isOpen;
    chat.style.display = isOpen ? 'flex' : 'none';

    if (isOpen) {
      document.getElementById('polaris-input').focus();
    }
  }

  // Add message to chat
  function addMessage(role, content) {
    const messagesDiv = document.getElementById('polaris-messages');
    const messageHTML = `
      <div style="
        display: flex;
        justify-content: ${role === 'user' ? 'flex-end' : 'flex-start'};
        margin-bottom: 12px;
      ">
        <div style="
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 12px;
          background: ${role === 'user' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ffffff'};
          color: ${role === 'user' ? 'white' : '#2d3748'};
          font-size: 14px;
          line-height: 1.5;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          ${content}
        </div>
      </div>
    `;

    messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Add loading indicator
  function showLoading() {
    const messagesDiv = document.getElementById('polaris-messages');
    const loadingHTML = `
      <div id="polaris-loading" style="
        display: flex;
        justify-content: flex-start;
        margin-bottom: 12px;
      ">
        <div style="
          padding: 10px 14px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          <div style="display: flex; gap: 4px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #cbd5e0; animation: bounce 1.4s infinite ease-in-out both;"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #cbd5e0; animation: bounce 1.4s infinite ease-in-out 0.2s both;"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #cbd5e0; animation: bounce 1.4s infinite ease-in-out 0.4s both;"></div>
          </div>
        </div>
      </div>
    `;

    messagesDiv.insertAdjacentHTML('beforeend', loadingHTML);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function hideLoading() {
    const loading = document.getElementById('polaris-loading');
    if (loading) loading.remove();
  }

  // Send message to API
  async function sendMessage() {
    const input = document.getElementById('polaris-input');
    const message = input.value.trim();

    if (!message) return;

    input.value = '';
    addMessage('user', message);
    showLoading();

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      if (data.sessionId && !sessionId) {
        sessionId = data.sessionId;
      }

      hideLoading();
      addMessage('assistant', data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      hideLoading();
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  }

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
