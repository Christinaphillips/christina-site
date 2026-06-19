const bubble      = document.getElementById('chatBubble');
const window_     = document.getElementById('chatWindow');
const closeBtn    = document.getElementById('chatClose');
const input       = document.getElementById('chatInput');
const sendBtn     = document.getElementById('chatSend');
const messages    = document.getElementById('chatMessages');
const suggestions = document.getElementById('chatSuggestions');
const heroForm    = document.getElementById('heroChat');
const heroInput   = document.getElementById('heroChatInput');

const history = [];
let hasInteracted = false;

function openChat() {
  window_.classList.add('open');
}
function toggleChat() {
  window_.classList.toggle('open');
}

bubble.addEventListener('click', toggleChat);
closeBtn.addEventListener('click', () => window_.classList.remove('open'));

input.addEventListener('keydown', e => { if (e.key === 'Enter') send(input.value); });
sendBtn.addEventListener('click', () => send(input.value));

// Suggested prompt chips
suggestions.querySelectorAll('.chat-chip').forEach(chip => {
  chip.addEventListener('click', () => send(chip.textContent));
});

// Hero chat bar — opens the window and sends the message
heroForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = heroInput.value.trim();
  if (!text) { openChat(); return; }
  openChat();
  send(text);
  heroInput.value = '';
});

// Auto-open after a few seconds (once, if the user hasn't engaged yet)
// Skipped on mobile / narrow screens to avoid interrupting.
if (window.matchMedia('(min-width: 641px)').matches) {
  setTimeout(() => {
    if (!hasInteracted) openChat();
  }, 4000);
}

function addMsg(text, role) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

async function send(rawText) {
  const text = (rawText || '').trim();
  if (!text) return;

  hasInteracted = true;
  input.value = '';
  if (suggestions) suggestions.remove();

  openChat();
  addMsg(text, 'user');
  history.push({ role: 'user', content: text });

  const typing = addMsg('Thinking…', 'assistant typing');

  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    typing.remove();
    const reply = data.reply || 'Sorry, something went wrong.';
    addMsg(reply, 'assistant');
    history.push({ role: 'assistant', content: reply });
  } catch {
    typing.remove();
    addMsg('Sorry, something went wrong. Try again!', 'assistant');
  }
}
