const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");
const streamOutput = document.getElementById("stream-output");

let threadId = null;

window.onload = () => {
  const welkomstHTML = `
    Welkom bij de <strong>AI Indicatiehulp</strong>!<br>
    Ik ben jouw digitale adviseur voor:<br>
    het stellen van de juiste indicatie en het opstellen van een conceptadvies voor de zorgexpert (Kim Brand).<br><br>

    <strong>Kies een optie om te starten:</strong><br>
    1. In kaart brengen cliëntsituatie<br>
    2. Indicatiestelling extramuraal (zorg thuis)<br>
    3. Indicatiestelling intramuraal (verpleeghuis)<br><br>

    Wil je direct een indicatieadvies laten opstellen? Dan heb ik meer informatie nodig over de cliënt.<br>
    Geef bij voorkeur ook je naam en een e-mailadres of telefoonnummer,<br>
    zodat we het conceptadvies voor beoordeling kunnen indienen.<br><br>

    <em>Met welke optie wil je verder?</em>
  `;
  appendFormattedMessage("agent-message", welkomstHTML);
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user-message", message);
  input.value = "";
  streamOutput.textContent = "";

  try {
    const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, thread_id: threadId })
    });

    const data = await response.json();
    threadId = data.thread_id;
  } catch (err) {
    appendMessage("agent-message", "⚠️ Er ging iets mis bij het ophalen van een antwoord.");
    console.error("Fout in fetch:", err);
  }
});

function appendMessage(cssClass, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", cssClass);
  msg.textContent = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function appendFormattedMessage(cssClass, htmlContent) {
  const msg = document.createElement("div");
  msg.classList.add("message", cssClass);
  msg.innerHTML = htmlContent;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

// ✅ SignalR setup
const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://chatproxy.azurewebsites.net/api/negotiate", {
    withCredentials: false  // ✅ voorkom CORS-misconfiguratie
  })
  .configureLogging(signalR.LogLevel.Information)
  .build();

connection.on("newToken", token => {
  streamOutput.textContent += token;
  chat.scrollTop = chat.scrollHeight;
});

connection
  .start()
  .then(() => console.log("✅ Verbonden met SignalR"))
  .catch(err => console.error("❌ SignalR fout:", err));
