function Message({ sender, text }) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-xl p-4 rounded-2xl ${
          isUser
            ? "bg-purple-600 text-white"
            : "bg-white shadow"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default Message;