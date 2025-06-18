<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Chat met Agent</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    #chat {
      flex-grow: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .message {
      margin: 10px;
      padding: 10px;
      border-radius: 10px;
      max-width: 70%;
      clear: both;
    }

    .message.user {
      background-color: #e0f7fa;
      align-self: flex-end;
      margin-left: auto;
    }

    .message.agent {
      background-color: #f1f8e9;
      align-self: flex-start;
      margin-right: auto;
    }

    .message-header {
      font-size: 0.8em;
      color: #555;
      margin-bottom: 4px;
    }

    .timestamp {
      float: right;
      font-size: 0.75em;
      color: #999;
    }

    form {
      display: flex;
      padding: 10px;
      background-color: #fff;
      border-top: 1px solid #ccc;
    }

    input[type="text"] {
      flex-grow: 1;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }

    button {
      padding: 10px 15px;
      font-size: 16px;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 5px;
      margin-left: 10px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="chat"></div>

  <form id="input-form">
    <input type="text" id="user-input" placeholder="Typ hier je bericht..." autocomplete="off" />
    <button type="submit">Verstuur</button>
  </form>

  <script>
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
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const msgWrapper = document.createElement("div");
      msgWrapper.className = sender === "Gebruiker" ? "message user" : "message agent";

      msgWrapper.innerHTML = `
        <div class="message-header">
          <strong>${sender}</strong> <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-body">${text}</div>
      `;

      chat.appendChild(msgWrapper);
      chat.scrollTop = chat.scrollHeight;
    }
  </script>
</body>
</html>
