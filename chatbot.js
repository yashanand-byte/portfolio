const chatLauncher = document.querySelector('#chat-launcher');
const chatPanel = document.querySelector('#portfolio-chat');
const chatClose = document.querySelector('#chat-close');
const chatNew = document.querySelector('#chat-new');
const chatMessages = document.querySelector('#chat-messages');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const chatSend = document.querySelector('#chat-send');

const greeting = "Hi, I can answer questions about Yash's portfolio and verified details. What would you like to know?";
const maxMessageLength = 1000;
const maxHistoryMessages = 12;
let conversation = [];
let isSending = false;

function appendMessage(role, text) {
  const message = document.createElement('article');
  message.className = `chat-message chat-message--${role}`;

  const speaker = document.createElement('span');
  speaker.className = 'chat-speaker';
  speaker.textContent = role === 'user' ? 'YOU' : 'ASSISTANT';

  const content = document.createElement('p');
  content.textContent = text;

  message.append(speaker, content);
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}

function updateSendButton() {
  chatSend.disabled = isSending || !chatInput.value.trim();
  chatNew.disabled = isSending;
}

function setPanelOpen(isOpen) {
  chatPanel.hidden = !isOpen;
  chatLauncher.setAttribute('aria-expanded', String(isOpen));
  chatLauncher.setAttribute('aria-label', isOpen ? 'Close Yash Anand\'s portfolio assistant' : 'Open Yash Anand\'s portfolio assistant');

  if (isOpen) chatInput.focus();
  else chatLauncher.focus();
}

function appendRetryMessage(text, failedMessage) {
  const errorMessage = appendMessage('error', text);
  const retryButton = document.createElement('button');
  retryButton.className = 'chat-retry';
  retryButton.type = 'button';
  retryButton.textContent = 'Try again';
  retryButton.addEventListener('click', () => {
    errorMessage.remove();
    sendMessage(failedMessage, false);
  });
  errorMessage.append(retryButton);
}

async function sendMessage(message, showUserMessage = true) {
  if (isSending) return;
  isSending = true;
  updateSendButton();

  if (showUserMessage) appendMessage('user', message);
  const typingMessage = appendMessage('typing', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: conversation })
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.error?.message || 'The chat service is temporarily unavailable. Please try again.');
    }
    if (typeof result?.reply !== 'string' || !result.reply.trim()) {
      throw new Error('The assistant returned an empty response. Please try again.');
    }

    conversation.push({ role: 'user', content: message }, { role: 'assistant', content: result.reply });
    conversation = conversation.slice(-maxHistoryMessages);
    appendMessage('assistant', result.reply.trim());
  } catch (error) {
    const safeMessage = error instanceof TypeError
      ? 'I could not reach the chat service. Check that the local server is running, then try again.'
      : error.message;
    appendRetryMessage(safeMessage, message);
  } finally {
    typingMessage.remove();
    isSending = false;
    updateSendButton();
  }
}

chatLauncher.addEventListener('click', () => setPanelOpen(chatPanel.hidden));
chatClose.addEventListener('click', () => setPanelOpen(false));
chatInput.addEventListener('input', updateSendButton);

chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    if (!isSending && chatInput.value.trim()) chatForm.requestSubmit();
  }
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message || isSending) return;

  if (message.length > maxMessageLength) {
    appendRetryMessage('Please keep your message under 1,000 characters.', message);
    return;
  }

  chatInput.value = '';
  updateSendButton();
  sendMessage(message);
});

chatNew.addEventListener('click', () => {
  if (isSending) return;
  conversation = [];
  chatMessages.replaceChildren();
  appendMessage('assistant', greeting);
  chatInput.value = '';
  updateSendButton();
  chatInput.focus();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !chatPanel.hidden) setPanelOpen(false);
});

updateSendButton();