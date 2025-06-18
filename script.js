const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", message);
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

    const fullText = await response.text();
    simulateTyping("assistant", fullText);
  } catch (err) {
    appendMessage("assistant", "Er ging iets mis.");
    console.error("Fout in fetch:", err);
  }
});

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.classList.add(role === "user" ? "user-message" : "agent-message");
  msg.innerText = `${text}`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function simulateTyping(role, fullText) {
  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.classList.add(role === "user" ? "user-message" : "agent-message");
  chat.appendChild(msg);

  let index = 0;
  const interval = setInterval(() => {
    msg.innerText = fullText.slice(0, index);
    chat.scrollTop = chat.scrollHeight;
    index++;
    if (index > fullText.length) clearInterval(interval);
  }, 20); // snelheid: 20ms per karakter
}
