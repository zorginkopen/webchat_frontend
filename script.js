// script.js - Werkende basisversie met minimale aanpassingen voor UX

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  function appendMessage(sender, text) {
    const messageElem = document.createElement("div");
    messageElem.className = sender === "user" ? "user-message" : "bot-message";
    messageElem.textContent = text;
    chatBox.appendChild(messageElem);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;

    appendMessage("user", userInput);
    input.value = "";

    try {
      const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
      });

      const result = await response.text();

      if (!response.ok) {
        appendMessage("bot", "(Fout): " + result);
      } else {
        appendMessage("bot", result);
      }
    } catch (error) {
      appendMessage("bot", "(Fout bij ophalen): " + error.message);
    }
  });
});
