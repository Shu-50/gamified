import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";


const socket = io("http://localhost:5000", {
  withCredentials: true,
});
 // ✅ point to your backend server

export default function ChatBox() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [messages, setMessages] = useState([]);
  const chatRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const emojis = ["😊", "😢", "❤️", "🎉", "😂", "😎"];

  useEffect(() => {
    socket.on("chat message", (data) => {
      setMessages((prev) => [...prev, data]);
      setTypingUser("");
    });

    socket.on("typing", (name) => {
      setTypingUser(`${name} is typing...`);
    });

    socket.on("stop typing", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("chat message");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const name = username.trim() || "Anonymous";
    const messageData = {
      text: message.trim(),
      user: name,
      isProfessor: name.toLowerCase().includes("prof"),
    };
    socket.emit("chat message", messageData);
    socket.emit("stop typing");
    setIsTyping(false);
    setMessage("");
  };

  const handleInput = (e) => {
    setMessage(e.target.value);

    if (!isTyping) {
      socket.emit("typing", username || "Someone");
      setIsTyping(true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing");
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-xl shadow-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-2">Real-time Chat</h2>

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your name"
        className="w-full mb-2 p-2 border rounded"
      />

      <div
        ref={chatRef}
        className="h-64 overflow-y-auto border p-2 mb-2 bg-gray-50 rounded space-y-2"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.isProfessor
                ? "bg-purple-100 border-l-4 border-purple-500 p-2 rounded"
                : "bg-white shadow p-2 rounded"
            }
          >
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-500 mb-2 h-5">{typingUser}</div>

      <div className="flex flex-wrap gap-2 mb-2" id="emoji-picker">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            className="emoji-btn text-xl"
            onClick={() => handleEmojiClick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={handleInput}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded resize-none h-10"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
