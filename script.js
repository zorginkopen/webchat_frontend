const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", message);
  input.value = "";

  const agentMsg = appendMessage("assistant", "..."); // tijdelijk placeholder
  try {
    const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (!response.ok || !response.body) {
      agentMsg.textContent = "Er ging iets mis met het ophalen van het antwoord.";
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let finalText = "";

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        finalText += chunk;
        agentMsg.textContent = finalText;
        chat.scrollTop = chat.scrollHeight;
      }
    }
  } catch (err) {
    agentMsg.textContent = "Er ging iets mis.";
    console.error("Fout in fetch:", err);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}-message`;
  msg.textContent = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}
