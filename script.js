let connection;

async function startSignalR() {
  try {
    // Gebruik GET in plaats van POST
    const negotiateResponse = await fetch("/api/negotiate");
    
    if (!negotiateResponse.ok) {
      throw new Error("Negotiate endpoint gaf status: " + negotiateResponse.status);
    }

    const negotiateData = await negotiateResponse.json();

    connection = new signalR.HubConnectionBuilder()
      .withUrl(negotiateData.url, {
        accessTokenFactory: () => negotiateData.accessToken
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Luister naar berichten van backend via SignalR
    connection.on("newToken", (data) => {
      console.log("✅ Ontvangen van SignalR:", data);
      appendMessage("agent", data);
    });

    await connection.start();
    console.log("✅ SignalR verbonden");
  } catch (err) {
    console.error("❌ SignalR fout:", err);
    appendMessage("agent", "⚠️ Verbinden met de server is mislukt.");
  }
}

// Bericht tonen in de chatbox
function appendMessage(sender, text) {
  const chat = document.getElementById("chat");
  const msgDiv = document.createElement("div");
  msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
  msgDiv.innerText = text;
  chat.appendChild(msgDiv);
  chat.scrollTop = chat.scrollHeight;
}

// Verstuur gebruikersbericht naar backend
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
    appendMessage("agent", "⚠️ Bericht verzenden mislukt.");
  }
});

// Start SignalR bij laden van de pagina
window.onload = () => {
  startSignalR();
};
