const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

let threadId = null; // Slaat de thread_id lokaal op

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", message); // Styling aangepast
  input.value = "";

  try {
    const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, thread_id: threadId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Responsetekst:", errorText);
      throw new Error(`Serverfout: ${response.status}`);
    }

    const data = await response.json();
    appendMessage("agent", data.reply); // Styling aangepast
    threadId = data.thread_id; // Bewaar thread_id voor vervolgvragen
  } catch (err) {
    appendMessage("agent", "Er ging iets mis.");
    console.error("Fout in fetch:", err);
  }
});

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", role === "user" ? "user-message" : "agent-message");
  msg.innerHTML = `<div class="bubble"><strong>${role === "user" ? "Gebruiker" : "Agent"}:</strong><br>${text}</div>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}
