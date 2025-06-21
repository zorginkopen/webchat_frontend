async function startSignalR() {
    try {
        // Stap 1: Vraag negotiate-informatie op van je Function App
        const response = await fetch("https://chatproxy.azurewebsites.net/api/negotiate", {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error(`Negotiate failed: ${response.status}`);
        }

        const connectionInfo = await response.json();

        // Stap 2: Bouw de verbinding met het opgehaalde URL + token
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(connectionInfo.url, {
                accessTokenFactory: () => connectionInfo.accessToken  // ⬅️ essentieel
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Stap 3: Stel eventhandler in
        connection.on("newMessage", message => {
            appendMessage("assistant", message);
        });

        // Stap 4: Start de verbinding
        await connection.start();
        console.log("✅ Verbonden met SignalR hub");
    } catch (err) {
        console.error("❌ SignalR fout:", err);
        appendMessage("assistant", "⚠️ Verbinden met SignalR is mislukt.");
    }
}

// Start verbinding bij laden
startSignalR();
