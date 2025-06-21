async function startSignalR() {
    try {
        // Ophalen van connectionInfo vanaf jouw negotiate endpoint
        const response = await fetch("https://chatproxy.azurewebsites.net/api/negotiate", {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error(`Negotiate failed: ${response.status}`);
        }

        const connectionInfo = await response.json();

        // Bouw de echte SignalR verbinding naar Azure SignalR
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://chatproxysignalr.service.signalr.net/client/?hub=chat", {
                accessTokenFactory: () => connectionInfo.accessToken
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Eventhandler
        connection.on("newMessage", message => {
            appendMessage("assistant", message);
        });

        // Start verbinding
        await connection.start();
        console.log("✅ Verbonden met SignalR hub");
    } catch (err) {
        console.error("❌ SignalR fout:", err);
        appendMessage("assistant", "⚠️ Verbinden met SignalR is mislukt.");
    }
}

startSignalR();
