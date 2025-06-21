async function startSignalR() {
  try {
    // Stap 1: Vraag negotiate-informatie op van je Azure Function
    const response = await fetch("https://chatproxy.azurewebsites.net/api/negotiate", {
      method: "POST"
    });

    if (!response.ok) {
      throw new Error(`Negotiate failed: ${response.status}`);
    }

    const connectionInfo = await response.json();

    // Logging: check de opgehaalde data
    console.log("🔗 Verbinding URL:", connectionInfo.url);
    console.log("🔑 Token start:", connectionInfo.accessToken?.slice(0, 30) + "...");

    // Stap 2: Bouw de SignalR-verbinding
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(connectionInfo.url, {
        accessTokenFactory: () => connectionInfo.accessToken
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Stap 3: Event handler voor binnenkomende berichten
    connection.on("newMessage", message => {
      if (typeof appendMessage === "function") {
        appendMessage("assistant", message);
      } else {
        console.log("📩 Bericht ontvangen (fallback):", message);
      }
    });

    // Stap 4: Start de verbinding
    await connection.start();
    console.log("✅ Verbonden met SignalR hub");

  } catch (err) {
    console.error("❌ SignalR fout:", err);
    if (typeof appendMessage === "function") {
      appendMessage("assistant", "⚠️ Verbinden met SignalR is mislukt.");
    } else {
      console.warn("⚠️ Verbinding mislukt (fallback):", err.message);
    }
  }
}

// Start de verbinding zodra het script geladen wordt
startSignalR();
