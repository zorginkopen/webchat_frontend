const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", message);
  input.value = "";

  const messageContainer = appendMessage("assistant", ""); // placeholder voor stream

  try {
    const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      console.error("Responsetekst:", errorText);
      throw new Error(`Serverfout: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
      messageContainer.innerHTML = result;
      chat.scrollTop = chat.scrollHeight;
    }
  } catch (err) {
    messageContainer.innerHTML = "Er ging iets mis.";
    console.error("Fout in fetch:", err);
  }
});

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = "message " + (role === "user" ? "user-message" : "agent-message");
  msg.innerHTML = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}
