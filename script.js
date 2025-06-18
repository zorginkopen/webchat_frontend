const form = document.querySelector('form');
const input = document.querySelector('#message');
const chatbox = document.querySelector('#chatbox');

let thread_id = null;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message);
  input.value = '';

  try {
    const response = await fetch('https://chatproxy.azurewebsites.net/api/chatproxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, thread_id })
    });

    const data = await response.json();
    if (response.ok) {
      thread_id = data.thread_id;
      appendMessage('assistant', data.response);
    } else {
      appendMessage('system', 'Fout: ' + data.error);
    }
  } catch (err) {
    appendMessage('system', 'Verbinding mislukt: ' + err.message);
  }
});

function appendMessage(role, content) {
  const div = document.createElement('div');
  div.className = role;
  div.textContent = `${role}: ${content}`;
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}
