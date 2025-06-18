document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendMessage("user", userMessage);
    input.value = "";

    try {
      const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error(`Serverfout: ${response.status}`);
      }

      const text = await response.text();
      appendMessage("assistant", text);
    } catch (error) {
      console.error("Fout in fetch:", error);
      appendMessage("assistant", "⚠️ Er ging iets mis bij het ophalen van het antwoord.");
    }
  });

  function appendMessage(role, text) {
    const messageElem = document.createElement("div");
    messageElem.className = role === "user" ? "user-message" : "assistant-message";
    messageElem.innerText = text;
    chatBox.appendChild(messageElem);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
