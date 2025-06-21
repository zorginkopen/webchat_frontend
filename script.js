async function startSignalR() {
  try {
    // Stap 1: Haal negotiate-informatie op
    const negotiateResponse = await fetch("https://chatproxy.azurewebsites.net/api/negotiate", {
      method: "POST"
    });

    if (!negotiateResponse.ok) {
      throw new Error(`Negotiate failed: ${negotiateResponse.status}`);
    }

    const negotiateData = await negotiateResponse.json();
    console.log("🔐 Negotiation gelukt:", negotiateData);

    // Stap 2: Start de SignalR-verbinding
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://chatproxysignalr.service.signalr.net/client/?hub=chat", {
        accessTokenFactory: () => negotiateData.accessToken
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Stap 3: Ontvang berichten van de backend
    connection.on("newToken", token => {
      const chat = document.getElementById("chat");
      const streamOutput = document.getElementById("streamOutput");
      if (streamOutput && chat) {
        streamOutput.textContent += token;
        chat.scrollTop = chat.scrollHeight;
      }
    });

    // Stap 4: Start verbinding
    await connection.start();
    console.log("✅ Verbonden met SignalR");

  } catch (err) {
    console.error("❌ SignalR fout:", err);
  }
}

startSignalR();
