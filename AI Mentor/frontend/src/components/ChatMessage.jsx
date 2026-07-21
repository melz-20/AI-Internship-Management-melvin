function ChatMessage({ sender, text }) {
  const isUser = sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-md ${
          isUser
            ? "bg-purple-600 text-white"
            : "bg-white text-gray-800"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default ChatMessage;