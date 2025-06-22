const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

let threadId = null;

// Openingsbericht bij het laden van de pagina
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
    streamMessage("agent-message", data.reply);
  } catch (err) {
    streamMessage("agent-message", "Er ging iets mis.");
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

function streamMessage(cssClass, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", cssClass);
  chat.appendChild(msg);

  const lines = text.split("\n").filter(line => line.trim() !== "");

  const isNumberedList = lines.length > 1 && lines.every(line => /^\d+\.\s+/.test(line.trim()));
  const isBulletedList = lines.length > 1 && lines.every(line => /^[-*•]\s+/.test(line.trim()));

  if (isNumberedList || isBulletedList) {
    const listElement = document.createElement(isNumberedList ? "ol" : "ul");
    msg.appendChild(listElement);
    let i = 0;

    const interval = setInterval(() => {
      if (i < lines.length) {
        const li = document.createElement("li");
        li.innerHTML  = lines[i].replace(/^(\d+\.\s+|[-*•]\s+)/, "").trim();
        listElement.appendChild(li);
        chat.scrollTop = chat.scrollHeight;
        i++;
      } else {
        clearInterval(interval);
      }
    }, 200);
  } else {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        msg.textContent += text.charAt(index++);
        chat.scrollTop = chat.scrollHeight;
      } else {
        clearInterval(interval);
      }
    }, 15);
  }
}
