const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("Gebruiker", message, "user-message");
  input.value = "";

  const agentMsg = appendMessage("Agent", "", "agent-message");

  try {
    const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      console.error("Responsetekst:", errorText);
      agentMsg.textContent = "Er ging iets mis.";
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      agentMsg.textContent = result;
      chat.scrollTop = chat.scrollHeight;
    }
  } catch (err) {
    console.error("Fout in fetch:", err);
    agentMsg.textContent = "Er ging iets mis.";
  }
});

function appendMessage(sender, text, cssClass) {
  const msg = document.createElement("div");
  msg.classList.add("message", cssClass);
  msg.innerHTML = `<div><strong>${sender}:</strong></div><div>${text}</div>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg.querySelector("div:last-child");
}
