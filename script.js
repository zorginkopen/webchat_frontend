const form = document.getElementById("chat-form");
const textarea = document.getElementById("message");
const chatContainer = document.getElementById("chat-container");
const statusDiv = document.getElementById("status");

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  await submitForm();
});

textarea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitForm();
  }
});

async function submitForm() {
  const message = textarea.value.trim();
  if (!message) return;

  appendMessage("user", message);
  textarea.value = "";

  statusDiv.textContent = "AI is aan het typen...";

  try {
    const response = await fetch("https://chatproxy.azurewebsites.net/api/chatproxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: message })
    });

    const data = await response.text();

    if (!response.ok) {
      throw new Error(`Serverfout: ${data}`);
    }

    appendMessage("assistant", data);
  } catch (error) {
    appendMessage("assistant", `Fout: ${error.message}`);
  } finally {
    statusDiv.textContent = "";
  }
}

function appendMessage(role, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = role;
  messageDiv.textContent = text;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
