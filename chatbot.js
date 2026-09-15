// TS GOLF Customer Support Chatbot Client Component — Gemini Integration & Clean UI

class TSGolfChatbot {
  constructor() {
    this.sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
    this.isOpen = false;
    this.hasUserInteracted = false;
    this.cart = JSON.parse(localStorage.getItem('tsgolf_cart') || '[]');
    this.init();
  }

  init() {
    this.renderWidgetHTML();
    this.bindEvents();
    this.updateCartBadge();
  }

  renderWidgetHTML() {
    const container = document.getElementById('tsgolf-chat-widget');
    if (!container) return;

    container.innerHTML = `
      <button id="chat-launcher" class="chat-launcher-btn" aria-label="Open TS GOLF Chat">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <div id="chat-window" class="chat-window hidden" role="dialog" aria-label="TS GOLF Customer Support Chat">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">TS</div>
            <div class="chat-title-wrapper">
              <h3>TS GOLF</h3>
              <div class="chat-subtitle">
                <span class="status-dot"></span> 24/7 UK Customer Support
              </div>
            </div>
          </div>
          <button id="chat-close" class="chat-header-close" aria-label="Close Chat">&times;</button>
        </div>

        <div id="chat-messages" class="chat-messages"></div>

        <div class="chat-input-bar">
          <input type="text" id="chat-input" class="chat-input" placeholder="Type your question..." aria-label="Chat input field">
          <button id="chat-send" class="chat-send-btn" aria-label="Send message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const launcher = document.getElementById('chat-launcher');
    const closeBtn = document.getElementById('chat-close');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');

    launcher.addEventListener('click', () => this.toggleChat());
    closeBtn.addEventListener('click', () => this.toggleChat(false));

    sendBtn.addEventListener('click', () => this.handleUserSend());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleUserSend();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.toggleChat(false);
      }
    });
  }

  toggleChat(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    const windowEl = document.getElementById('chat-window');
    if (this.isOpen) {
      windowEl.classList.remove('hidden');
      document.getElementById('chat-input').focus();
    } else {
      windowEl.classList.add('hidden');
    }
  }

  async handleUserSend() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    this.addUserMessage(text);
    await this.sendChatMessage(text);
  }

  async sendChatMessage(text) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.sessionId, message: text })
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();

      this.addAssistantMessage(data.reply, data.showOrderLookup);
    } catch (e) {
      this.addAssistantMessage("Sorry, I didn’t catch that. Could you try asking me again?");
    }
  }

  addUserMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    this.scrollToBottom();
  }

  addAssistantMessage(text, showOrderLookup = false) {
    const messagesContainer = document.getElementById('chat-messages');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble assistant';

    // Format Markdown bold, newlines, and convert URLs to clean clickable links
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" style="color:#111111; font-weight:600; text-decoration:underline;">$1</a>')
      .replace(/\n•/g, '<br>•')
      .replace(/\n/g, '<br>');

    bubble.innerHTML = formattedText;

    // Render Order Lookup Form if requested
    if (showOrderLookup) {
      const formEl = document.createElement('div');
      formEl.className = 'order-lookup-form';
      formEl.innerHTML = `
        <input type="text" id="lookup-order-id" placeholder="Order Number (e.g. TS1001)">
        <input type="email" id="lookup-email" placeholder="Your Email Address">
        <button onclick="window.tsgolfChatbot.submitOrderLookup()">Check Order Status</button>
      `;
      bubble.appendChild(formEl);
    }

    messagesContainer.appendChild(bubble);
    this.scrollToBottom();
  }

  async submitOrderLookup() {
    const orderId = document.getElementById('lookup-order-id')?.value;
    const email = document.getElementById('lookup-email')?.value;

    if (!orderId) {
      alert("Please enter your order number.");
      return;
    }

    try {
      const res = await fetch('/api/order/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderId, email })
      });
      const data = await res.json();

      if (data.found && data.order) {
        const o = data.order;
        this.addAssistantMessage(
          `**Order #${orderId} Details:**\n• **Status:** ${o.status}\n• **Carrier:** ${o.carrier}\n• **Handling:** ${o.handlingTime || '1-2 business days'}\n• **Transit:** ${o.transitTime || '1-3 business days'}\n\nNeed help with anything else on your order?`
        );
      } else {
        this.addAssistantMessage("We couldn't locate that specific order number right away. Please reach out to our UK support team at info@tsgolf.co.uk with your full name & email.");
      }
    } catch (e) {
      this.addAssistantMessage("Error looking up order. Please email info@tsgolf.co.uk.");
    }
  }

  updateCartBadge() {
    const badge = document.getElementById('cart-count-badge');
    if (badge) {
      badge.textContent = this.cart.length;
    }
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Initialize global chatbot component on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.tsgolfChatbot = new TSGolfChatbot();
});
