document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("chat-form");
    const input = document.getElementById("user-input");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        try {
            console.log("📤 Verzenden naar backend:", message);

            const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });

            const text = await response.text();
            console.log("📥 Responsetekst:", text);

            if (!response.ok) {
                throw new Error(`Serverfout: ${response.status}`);
            }
        } catch (error) {
            console.error("❌ Fout in fetch:", error);
        }

        input.value = "";
    });
});
