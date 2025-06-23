const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

let threadId = null;

// Openingsbericht bij het laden van de pagina
window.onload = () => {
  const welkomstHTML = `
    Welkom bij <strong>Indicatiehulp.ai</strong>!<br>
    Ik ben Indi, jouw digitale adviseur voor:<br>
    het stellen van de juiste indicatie en het opstellen van een conceptadvies voor de (Evean) zorgexpert.<br><br>

    <strong>Het volgende is bijv. mogelijk:</strong><br>
    - In kaart brengen cliëntsituatie<br>
    - Indicatiestelling extramuraal (zorg thuis)<br>
    - Indicatiestelling intramuraal (verpleeghuis)<br><br>

    Wil je direct een indicatieadvies laten opstellen? Dan heb ik meer informatie nodig over de cliënt.<br>
    Geef bij voorkeur ook je naam en een e-mailadres of telefoonnummer,<br>
    zodat we het conceptadvies voor beoordeling kunnen indienen.<br><br>

    <em>Start met het adviesgesprek</em>
  `;
  appendFormattedMessage("agent-message", welkomstHTML);
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  appendMessage("user-message", message);
  input.value = "";

  try {
    const response = await fetch("https://chatproxy2-f5hygzgbckapejcu.francecentral-01.azurewebsites.net/api/chatproxy2", {
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
    threadId = data.thread_id;
    renderMessage("agent-message", data.reply);
  } catch (err) {
    renderMessage("agent-message", "Er ging iets mis.");
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

function renderMessage(cssClass, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", cssClass);
  chat.appendChild(msg);

  // Zet **vetgedrukte** en *cursieve* accenten om
  let htmlText = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // vet
    .replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, "<em>$1</em>"); // cursief

  const lines = htmlText.split("\n").filter(line => line.trim() !== "");

  const isNumberedList = lines.length > 1 && lines.every(line => /^\d+\.\s+/.test(line));
  const isBulletedList = lines.length > 1 && lines.every(line => /^[-*•]\s+/.test(line));

  if (isNumberedList || isBulletedList) {
    const listElement = document.createElement(isNumberedList ? "ol" : "ul");
    msg.appendChild(listElement);

    lines.forEach(line => {
      const li = document.createElement("li");
      const clean = line.replace(/^(\d+\.\s+|[-*•]\s+)/, "").trim();
      li.innerHTML = clean;
      listElement.appendChild(li);
    });
  } else {
    const p = document.createElement("p");
    p.innerHTML = htmlText.replace(/\n/g, "<br>");
    msg.appendChild(p);
  }

  chat.scrollTop = chat.scrollHeight;
}
