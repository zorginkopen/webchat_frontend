async function startSignalR() {
  try {
    const negotiateResponse = await fetch("https://chatproxy.azurewebsites.net/api/negotiate", {
      method: "POST"
    });

    if (!negotiateResponse.ok) {
      throw new Error(`Negotiate failed: ${negotiateResponse.status}`);
    }

    const negotiateData = await negotiateResponse.json();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(negotiateData.url, {
        accessTokenFactory: () => negotiateData.accessToken
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on("newToken", token => {
      streamOutput.textContent += token;
      chat.scrollTop = chat.scrollHeight;
    });

    await connection.start();
    console.log("✅ Verbonden met SignalR");
  } catch (err) {
    console.error("❌ SignalR fout:", err);
  }
}

startSignalR();
