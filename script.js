const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("Gebruiker", message);
  input.value = "";

  try {
    const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Responsetekst:", errorText);
      throw new Error(`Serverfout: ${response.status}`);
    }

    const text = await response.text();
    appendMessage("Agent", text);
  } catch (err) {
    appendMessage("Agent", "Er ging iets mis.");
    console.error("Fout in fetch:", err);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = "message " + (sender === "Gebruiker" ? "user-message" : "agent-message");
  msg.textContent = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}
