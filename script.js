document.getElementById('chat-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    appendMessage('user', message);
    input.value = '';
    
    const responseElement = appendMessage('assistant', ''); // Leeg bericht dat we gaan vullen

    const response = await fetch('https://<JOUW-FUNCTION-APP-URL>/api/chatproxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });

    if (!response.ok || !response.body) {
        responseElement.textContent = '⚠️ Fout bij ophalen van antwoord.';
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        responseElement.textContent = fullText;
    }
});

function appendMessage(role, content) {
    const chatBox = document.getElementById('chat-box');
    const messageElem = document.createElement('div');
    messageElem.className = role;
    messageElem.textContent = content;
    chatBox.appendChild(messageElem);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElem;
}
