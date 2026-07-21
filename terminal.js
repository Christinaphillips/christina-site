// ── Hero typing animation ──
const heroName = document.getElementById('heroName');
const heroTag  = document.getElementById('heroTag');
const aboutBlock = document.getElementById('aboutBlock');

const NAME = 'christina melas-kyriazi';
const TAG  = 'investor · san francisco';

function typeInto(el, text, speed) {
  return new Promise(resolve => {
    el.classList.add('typing');
    let i = 0;
    const tick = () => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, speed);
      } else {
        el.classList.remove('typing');
        resolve();
      }
    };
    tick();
  });
}

aboutBlock.style.opacity = '0';
aboutBlock.style.transition = 'opacity 0.5s ease';

(async () => {
  await typeInto(heroName, NAME, 45);
  await typeInto(heroTag, TAG, 22);
  aboutBlock.style.opacity = '1';
})();

// ── Chat ──
const form     = document.getElementById('chatForm');
const input    = document.getElementById('chatInput');
const log       = document.getElementById('chatLog');
const hints    = document.getElementById('chatHints');

const history = [];

function addLine(text, role) {
  const div = document.createElement('div');
  div.className = `chat-line ${role === 'user' ? 'user' : ''} ${role === 'typing' ? 'typing-line' : ''}`;
  const who = role === 'user' ? 'you:' : 'christina_ai:';
  div.innerHTML = `<span class="who">${who}</span> <span class="txt"></span>`;
  div.querySelector('.txt').textContent = text;
  log.appendChild(div);
  div.scrollIntoView({ block: 'nearest' });
  return div;
}

hints.querySelectorAll('.chat-hint').forEach(btn => {
  btn.addEventListener('click', () => send(btn.textContent));
});

form.addEventListener('submit', e => {
  e.preventDefault();
  send(input.value);
});

async function send(rawText) {
  const text = (rawText || '').trim();
  if (!text) return;
  input.value = '';
  if (hints) hints.remove();

  addLine(text, 'user');
  history.push({ role: 'user', content: text });

  const typing = addLine('thinking…', 'typing');

  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    typing.remove();
    const reply = data.reply || 'sorry, something went wrong.';
    addLine(reply, 'assistant');
    history.push({ role: 'assistant', content: reply });
  } catch {
    typing.remove();
    addLine('sorry, something went wrong. try again!', 'assistant');
  }
}
