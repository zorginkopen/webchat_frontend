const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

const messageHistory = [];

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", message);
  messageHistory.push({ role: "user", content: message });
  input.value = "";

  try {
    const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messageHistory })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Responsetekst:", errorText);
      throw new Error(`Serverfout: ${response.status}`);
    }

    const text = await response.text();
    appendMessage("assistant", text);
    messageHistory.push({ role: "assistant", content: text });

  } catch (err) {
    appendMessage("assistant", "Er ging iets mis.");
    console.error("Fout in fetch:", err);
  }
});

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = "message " + (role === "user" ? "user-message" : "agent-message");
  msg.textContent = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}
