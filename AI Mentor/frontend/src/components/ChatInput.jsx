import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPaperPlane,
  FaPaperclip,
  FaMicrophone,
} from "react-icons/fa";

function ChatInput({
  setMessages,
  setLoading,
  conversationId,
  setConversationId,
}) {
  const [input, setInput] = useState("");

  // ----------------------------
  // Listen for Suggested Questions
  // ----------------------------
  useEffect(() => {
    const handler = (event) => {
      setInput(event.detail);
    };

    window.addEventListener(
      "suggestion-selected",
      handler
    );

    return () => {
      window.removeEventListener(
        "suggestion-selected",
        handler
      );
    };
  }, []);

  // ----------------------------
  // Send Message
  // ----------------------------
  const sendMessage = async (customMessage = null) => {
    const question = customMessage || input;

    if (!question.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: question,
      },
    ]);

    setInput("");

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://127.0.0.1:8000/chat",
        {
          message: question,
          conversation_id: conversationId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: response.data.reply,
        },
      ]);

      // First message of a new conversation -- remember its id
      // so every following message in this session attaches to it.
      if (!conversationId && response.data.conversation_id) {
        setConversationId(response.data.conversation_id);
      }

    } catch (error) {
      console.error(error);

      let errorMessage = "❌ Could not connect to AI.";

      if (error.response?.status === 401) {
        errorMessage = "❌ Please login again.";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-t p-4 flex items-center gap-4 rounded-b-2xl">

      {/* Attachment Button */}

      <button className="text-purple-600 hover:text-purple-800">
        <FaPaperclip />
      </button>

      {/* Input */}

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
        placeholder="Ask your AI Mentor..."
        className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Microphone */}

      <button className="text-purple-600 hover:text-purple-800">
        <FaMicrophone />
      </button>

      {/* Send Button */}

      <button
        onClick={() => sendMessage()}
        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition"
      >
        <FaPaperPlane />
      </button>

    </div>
  );
}

export default ChatInput;
