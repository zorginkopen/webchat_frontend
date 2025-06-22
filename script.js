function streamMessage(cssClass, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", cssClass);
  chat.appendChild(msg);

  const lines = text.split("\n");

  let currentList = null;

  const interval = setInterval(() => {
    if (lines.length === 0) {
      clearInterval(interval);
      return;
    }

    const line = lines.shift().trim();

    if (line === "") {
      const br = document.createElement("br");
      msg.appendChild(br);
      return;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    const bulletMatch = line.match(/^[-*•]\s+(.*)/);

    if (numberedMatch) {
      if (!currentList || currentList.tagName !== "OL") {
        currentList = document.createElement("ol");
        msg.appendChild(currentList);
      }
      const li = document.createElement("li");
      li.textContent = numberedMatch[2];
      currentList.appendChild(li);
    } else if (bulletMatch) {
      if (!currentList || currentList.tagName !== "UL") {
        currentList = document.createElement("ul");
        msg.appendChild(currentList);
      }
      const li = document.createElement("li");
      li.textContent = bulletMatch[1];
      currentList.appendChild(li);
    } else {
      currentList = null;
      const p = document.createElement("p");
      p.textContent = line;
      msg.appendChild(p);
    }

    chat.scrollTop = chat.scrollHeight;
  }, 50);
}
