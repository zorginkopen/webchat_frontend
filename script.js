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
      throw new Error(`Serverfout: ${response.status}`);
    }

    const data = await response.json();
    const output = data.tool_output || "Geen antwoord ontvangen.";
    appendMessage("Agent", output);

  } catch (err) {
    appendMessage("Agent", "Er ging iets mis.");
    console.error("Fout in fetch:", err);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.innerHTML = `<div class="user">${sender}:</div><div class="agent">${text}</div>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

