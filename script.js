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
  streamOutput.textContent =
