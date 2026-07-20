import ChatMessage from "./ChatMessage";

function ChatWindow() {
  const messages = [
    {
      sender: "ai",
      message: "Hello 👋 I'm your AI Mentor. Ask me anything."
    },
    {
      sender: "user",
      message: "Explain Artificial Intelligence."
    },
    {
      sender: "ai",
      message:
        "Artificial Intelligence (AI) is the simulation of human intelligence by machines. It enables computers to learn, reason, solve problems, and make decisions."
    },
  ];

  return (
    <div className="bg-purple-100 rounded-2xl p-6 h-[500px] overflow-y-auto">

      {messages.map((msg, index) => (
        <ChatMessage
          key={index}
          sender={msg.sender}
          message={msg.message}
        />
      ))}

    </div>
  );
}

export default ChatWindow;