function appendMessage(sender, message) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");

  msg.classList.add("message");
  msg.classList.add(sender === "user" ? "user-message" : "agent-message");
  msg.textContent = message;

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

async function startSignalR() {
  try {
    const response = await fetch("https://chatproxy.azurewebsites.net/api/negotiate", {
      method: "POST"
    });

    if (!response.ok) {
      throw new Error(`Negotiate failed: ${response.status}`);
    }

    const connectionInfo = await response.json();

    console.log("🔗 Verbinding URL:", connectionInfo.url);
    console.log("🔑 Token start:", connectionInfo.accessToken?.slice(0, 30) + "...");

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(connectionInfo.url, {
        accessTokenFactory: () => connectionInfo.accessToken,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on("newMessage", message => {
      appendMessage("assistant", message);
    });

    await connection.start();
    console.log("✅ Verbonden met SignalR hub");

  } catch (err) {
    console.error("❌ SignalR fout:", err);
    appendMessage("assistant", "⚠️ Verbinden met SignalR is mislukt.");
  }
}

document.getElementById("input-form").addEventListener("submit", async event => {
  event.preventDefault();
  const inputField = document.getElementById("user-input");
  const message = inputField.value.trim();
  if (message === "") return;

  appendMessage("user", message);
  inputField.value = "";

  // Hier kun je eventueel later een fetch toevoegen naar je backend
});

startSignalR();
