const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

let threadId = null;

// Openingsbericht bij laden van de pagina
window.onload = () => {
  const welkomstHTML = `
    Welkom bij de <strong>AI Indicatiehulp</strong>!<br>
    Ik ben jouw digitale adviseur voor:<br>
    het stellen van de juiste indicatie en het opstellen van een conceptadvies voor de zorgexpert (Kim Brand).<br><br>

    <strong>Kies een optie om te starten:</strong><br>
    1. In kaart brengen cliëntsituatie<br>
    2. Bekijk richtlijnen<br>
    3. Contact opnemen met de zorgexpert<br><br>

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

  const numberedItems = text.match(/(\d+\.\s[^(\d+\.)]+)/g);
  const bulletedItems = text.match(/([*-•]\s[^*-•]+)/g);

  if (numberedItems && numberedItems.length >= 2) {
    const ol = document.createElement("ol");
    msg.appendChild(ol);
    let i = 0;
    const interval = setInterval(() => {
      if (i < numberedItems.length) {
        const li = document.createElement("li");
        li.textContent = numberedItems[i].trim();
        ol.appendChild(li);
        chat.scrollTop = chat.scrollHeight;
        i++;
      } else {
        clearInterval(interval);
      }
    }, 200);
  } else if (bulletedItems && bulletedItems.length >= 2) {
    const ul = document.createElement("ul");
    msg.appendChild(ul);
    let i = 0;
    const interval = setInterval(() => {
      if (i < bulletedItems.length) {
        const li = document.createElement("li");
        li.textContent = bulletedItems[i].trim();
        ul.appendChild(li);
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
