let connection;

async function startSignalR() {
  try {
    // Haal token en URL op van negotiate backend
    const negotiateResponse = await fetch("/api/negotiate", { method: "POST" });
    const negotiateData = await negotiateResponse.json();

    connection = new signalR.HubConnectionBuilder()
      .withUrl(negotiateData.url, {
        accessTokenFactory: () => negotiateData.accessToken
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Ontvangen bericht van backend
    connection.on("newToken", (data) => {
      console.log("✅ Ontvangen van SignalR:", data);
      appendMessage("agent", data);  // Tekstbericht toevoegen aan chatvenster
    });

    await connection.start();
    console.log("✅ Verbonden met SignalR");
  } catch (err) {
    console.error("❌ SignalR fout:", err);
  }
}

function appendMessage(sender, text) {
  const chat = document.getElementById("chat");
  const msgDiv = document.createElement("div");
  msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
  msgDiv.innerText = text;
  chat.appendChild(msgDiv);
  chat.scrollTop = chat.scrollHeight;
}

// Verstuur bericht naar backend via fetch (start response)
document.getElementById("input-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", message);
  input.value = "";

  try {
    await fetch("/api/chatproxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: message })
    });
  } catch (error) {
    console.error("❌ Fout bij versturen bericht:", error);
    appendMessage("agent", "⚠️ Er ging iets mis bij het verzenden.");
  }
});

window.onload = () => {
  startSignalR();
};
