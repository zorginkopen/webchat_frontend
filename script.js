const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

let threadId = null; // Slaat de thread_id lokaal op

// Welkomstbericht tonen bij opstart
window.addEventListener("DOMContentLoaded", () => {
  const welcomeMessage = `
    Welkom bij de AI Indicatiehulp! Ik ben jouw digitale adviseur voor het stellen van de juiste indicatie en het opstellen van een conceptadvies voor de zorgexpert (Kim Brand).<br><br>
    <strong>Kies een optie om te starten:</strong><br>
    1. In kaart brengen cliëntsituatie<br>
    2. Bekijk richtlijnen<br>
    3. Contact opnemen met de zorgexpert<br><br>
    Wil je direct een indicatieadvies laten opstellen? Dan heb ik meer informatie nodig over de cliënt.<br>
    Met welke optie wil je verder?<br>
    Geef bij voorkeur ook je naam en een e-mail of telefoonnummer, zodat we het conceptadvies voor beoordeling kunnen indienen.
  `;
  appendMessage("agent", welcomeMessage);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user", message);
  input.value = "";

  try {
    const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, thread_id: threadId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Responsetekst:", errorText);
      throw new Error(`Serverfout: ${response.status}`);
    }

    const data = await response.json();
    appendMessage("agent", data.reply);
    threadId = data.thread_id; // Bewaar voor vervolgvragen
  } catch (err) {
    appendMessage("agent", "Er ging iets mis.");
    console.error("Fout in fetch:", err);
  }
});

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", role === "user" ? "user-message" : "agent-message");
  msg.innerHTML = text; // HTML renderen i.p.v. tekst
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}
