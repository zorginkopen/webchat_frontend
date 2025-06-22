const form = document.getElementById("input-form");
const input = document.getElementById("user-input");
const messagesContainer = document.getElementById("messages");

// 🔸 Openingsbericht bij laden
window.addEventListener("DOMContentLoaded", () => {
  const openingText = `
**Hallo! Welkom bij de AI Indicatiehulp.** 😊<br><br>
Mijn naam is Indi, en ik help je graag bij het stellen van de juiste indicatie voor je cliënt.<br><br>
Waarmee kan ik je vandaag ondersteunen?<br><br>
- **1.** In kaart brengen cliëntsituatie<br>
- **2.** Indicatiestelling extramuraal (Zorg Thuis)<br>
- **3.** Indicatiestelling intramuraal (verpleeghuis)<br><br>
Kies een optie of stel gerust je vraag!
  `;
  appendMessage("assistant", openingText);
});

// 🔸 Form submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  try {
    const response = await fetch("https://chatproxy2-f5hygzgbckapejcu.francecentral-01.azurewebsites.net/api/chatproxy2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
      throw new Error("Serverfout: " + response.status);
    }

    const data = await response.json();
    const formattedReply = formatReply(data.reply);
    appendMessage("assistant", formattedReply);
  } catch (error) {
    appendMessage("assistant", "Er is iets misgegaan. Probeer het later opnieuw.");
    console.error("Fout in fetch:", error);
  }
});

// 🔸 Bericht toevoegen aan chat
function appendMessage(role, message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", role);
  messageElement.innerHTML = message;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 🔸 Formatter voor GPT-reacties (vet, bullets, witregels)
function formatReply(rawText) {
  return rawText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // vet
    .replace(/\n\n/g, '<br><br>')                      // dubbele witregel
    .replace(/\n/g, '<br>');                           // enkele witregel
}
