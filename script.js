const chat = document.getElementById("chat");
const form = document.getElementById("input-form");
const input = document.getElementById("user-input");

let threadId = null;

// Toon openingsbericht bij het laden van de pagina
window.onload = () => {
  const welkomstekst = `Welkom bij de AI Indicatiehulp! Ik ben jouw digitale adviseur voor het stellen van de juiste indicatie en het opstellen van een conceptadvies voor de zorgexpert (Kim Brand).\n\nKies een optie om te starten:\n1. In kaart brengen cliëntsituatie\n2. Bekijk richtlijnen\n3. Contact opnemen met de zorgexpert\n\nWil je direct een indicatieadvies laten opstellen? Dan heb ik meer informatie nodig over de cliënt. Geef bij voorkeur ook je naam en een e-mail of telefoonnummer, zodat we het conceptadvies voor beoordeling kunnen indienen.\n\nMet welke optie wil je verder?`;
  streamMessage("agent-message", welkomstekst);
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
  msg.innerHTML = text.replace(/\n/g, "<br>");
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function streamMessage(cssClass, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", cssClass);
  msg.innerHTML = "";
  chat.appendChild(msg);

  const chars = text.replace(/\n/g, "<br>").split("");
  let index = 0;

  const interval = setInterval(() => {
    if (index < chars.length) {
      msg.innerHTML += chars[index++];
      chat.scrollTop = chat.scrollHeight;
    } else {
      clearInterval(interval);
    }
  }, 15);
}
