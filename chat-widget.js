(function () {
  const config = window.ChatWidgetConfig || {};
  const webhookUrl = config.webhook?.url || "";
  const logo = config.branding?.logo || "";
  const botName = config.branding?.name || "Chatbot";
  const welcomeText = config.branding?.welcomeText || "Hi there! 👋";
  const responseTimeText = config.branding?.responseTimeText || "";
  const botAvatar = config.branding?.botAvatar || "https://i.ibb.co/pjYQz8R/bot-avatar.png";
  const userAvatar = config.branding?.userAvatar || "https://i.ibb.co/q0npqkd/user-avatar.png";
  const primaryColor = config.style?.primaryColor || "#6b000b";
  const fontColor = config.style?.fontColor || "#1f2937";

  const createStyle = () => {
    const style = document.createElement("style");
    style.innerHTML = `
      .chat-widget {
        font-family: sans-serif;
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        max-height: 500px;
        border-radius: 12px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        z-index: 9999;
      }
      .chat-header {
        background: ${primaryColor};
        color: white;
        padding: 10px;
        display: flex;
        align-items: center;
      }
      .chat-header img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 10px;
      }
      .chat-body {
        background: #fff;
        padding: 10px;
        overflow-y: auto;
        flex: 1;
      }
      .chat-message {
        margin: 10px 0;
        display: flex;
        align-items: flex-end;
      }
      .chat-message.bot {
        flex-direction: row;
      }
      .chat-message.user {
        flex-direction: row-reverse;
      }
      .chat-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin: 0 8px;
      }
      .chat-bubble {
        padding: 10px;
        border-radius: 12px;
        max-width: 70%;
        background: #f1f1f1;
        position: relative;
        color: ${fontColor};
      }
      .chat-message.bot .chat-bubble {
        background: #eeeeee;
      }
      .chat-message.user .chat-bubble {
        background: ${primaryColor};
        color: white;
      }
      .chat-time {
        font-size: 10px;
        color: #888;
        margin-top: 2px;
      }
      .chat-input {
        display: flex;
        padding: 10px;
        border-top: 1px solid #ccc;
        background: #f9f9f9;
      }
      .chat-input input {
        flex: 1;
        padding: 8px;
        border-radius: 6px;
        border: 1px solid #ccc;
        outline: none;
      }
      .chat-input button {
        background: ${primaryColor};
        border: none;
        color: white;
        padding: 8px 12px;
        margin-left: 5px;
        border-radius: 6px;
        cursor: pointer;
      }
      .typing {
        font-size: 12px;
        font-style: italic;
        color: #aaa;
        margin: 5px 0;
      }
    `;
    document.head.appendChild(style);
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const playSound = () => {
    const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.mp3");
    audio.play();
  };

  const createChat = () => {
    const container = document.createElement("div");
    container.className = "chat-widget";

    const header = document.createElement("div");
    header.className = "chat-header";
    header.innerHTML = `<img src="${logo}" alt="Logo"><strong>${botName}</strong>`;

    const body = document.createElement("div");
    body.className = "chat-body";

    const typing = document.createElement("div");
    typing.className = "typing";
    typing.textContent = "";
    body.appendChild(typing);

    const inputContainer = document.createElement("div");
    inputContainer.className = "chat-input";

    const input = document.createElement("input");
    input.placeholder = "Type your message...";

    const button = document.createElement("button");
    button.textContent = "Send";

    inputContainer.appendChild(input);
    inputContainer.appendChild(button);

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(inputContainer);

    document.body.appendChild(container);

    const addMessage = (text, sender = "bot") => {
      const msg = document.createElement("div");
      msg.className = `chat-message ${sender}`;

      const avatar = document.createElement("img");
      avatar.className = "chat-avatar";
      avatar.src = sender === "bot" ? botAvatar : userAvatar;

      const bubble = document.createElement("div");
      bubble.className = "chat-bubble";
      bubble.textContent = text;

      const time = document.createElement("div");
      time.className = "chat-time";
      time.textContent = formatTime();

      const bubbleWrap = document.createElement("div");
      bubbleWrap.appendChild(bubble);
      bubbleWrap.appendChild(time);

      msg.appendChild(avatar);
      msg.appendChild(bubbleWrap);

      body.appendChild(msg);
      typing.textContent = "";
      body.scrollTop = body.scrollHeight;

      if (sender === "bot") playSound();
    };

    addMessage(welcomeText, "bot");

    button.addEventListener("click", async () => {
      const msg = input.value.trim();
      if (!msg) return;

      addMessage(msg, "user");
      input.value = "";

      typing.textContent = "Bot is typing...";

      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg }),
        });

        const data = await res.json();
        addMessage(data.reply || "Sorry, I couldn't understand that.", "bot");
      } catch (e) {
        addMessage("Error reaching server.", "bot");
      }
    });
  };

  createStyle();
  createChat();
})();
