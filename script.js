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

  // Vervang **...** door <strong>...</strong>
  const formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Detecteer inline genummerde lijst: "1. ..., 2. ..., 3. ..."
  const listPattern = /(?:^|\s)(\d+\.\s.*?)(?=\s\d+\.\s|$)/gs;
  const matches = [...formattedText.matchAll(listPattern)];

  if (matches.length >= 2) {
    // Introductietekst vóór de eerste lijst
    const introText = formattedText.split(matches[0][0])[0].trim();
    if (introText) {
      const p = document.createElement("p");
      p.innerHTML = introText;
      msg.appendChild(p);
    }

    const ol = document.createElement("ol");
    matches.forEach(match => {
      const itemText = match[1].replace(/^\d+\.\s*/, "").trim();
      const li = document.createElement("li");
      li.innerHTML = itemText;
      ol.appendChild(li);
    });
    msg.appendChild(ol);
  } else {
    // Geen inline genummerde lijst → toon tekst met stream effect
    let index = 0;
    const interval = setInterval(() => {
      if (index < formattedText.length) {
        msg.innerHTML += formattedText.charAt(index++);
        chat.scrollTop = chat.scrollHeight;
      } else {
        clearInterval(interval);
      }
    }, 15);
  }
}
