import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import { FaFileAlt, FaFilePdf } from "react-icons/fa";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatBox from "../components/ChatBox";
import ChatInput from "../components/ChatInput";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [searchParams] = useSearchParams();

  const suggestions = [
    "📘 Summarize my uploaded notes",
    "📝 Give me important exam questions",
    "❓ Quiz me from my notes",
    "📖 Explain the uploaded PDF",
    "🧠 Give me MCQs from my notes",
    "📚 What are the key concepts?"
  ];

  // Load an existing conversation if the URL has ?conversation_id=
  useEffect(() => {
    const idParam = searchParams.get("conversation_id");

    if (!idParam) {
      // No conversation specified -- start fresh
      setMessages([]);
      setConversationId(null);
      return;
    }

    loadConversation(idParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadConversation = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://127.0.0.1:8000/history/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const loadedMessages = [];

      response.data.messages.forEach((msg) => {
        loadedMessages.push({ sender: "user", text: msg.question });
        loadedMessages.push({ sender: "ai", text: msg.answer });
      });

      setMessages(loadedMessages);
      setConversationId(response.data.id);

    } catch (error) {
      console.error(error);
    }
  };

  // ----------------------------------------------------
  // Export chat as a plain .txt file
  // ----------------------------------------------------
  const exportAsTxt = () => {
    if (messages.length === 0) return;

    let content = "AI Mentor - Chat Export\n";
    content += "========================\n\n";

    messages.forEach((msg) => {
      const label = msg.sender === "user" ? "You" : "AI Mentor";
      content += `${label}:\n${msg.text}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ai-mentor-chat.txt");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // ----------------------------------------------------
  // Export chat as a .pdf file
  // ----------------------------------------------------
  const exportAsPdf = () => {
    if (messages.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    let y = 20;

    doc.setFontSize(16);
    doc.text("AI Mentor - Chat Export", margin, y);
    y += 10;

    doc.setFontSize(11);

    messages.forEach((msg) => {
      const label = msg.sender === "user" ? "You:" : "AI Mentor:";

      // Add a new page if we're near the bottom
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      doc.setFont(undefined, "bold");
      doc.text(label, margin, y);
      y += 6;

      doc.setFont(undefined, "normal");

      const lines = doc.splitTextToSize(msg.text, maxLineWidth);

      lines.forEach((line) => {
        if (y > 285) {
          doc.addPage();
          y = 20;
        }

        doc.text(line, margin, y);
        y += 6;
      });

      y += 4;
    });

    doc.save("ai-mentor-chat.pdf");
  };

  return (
    <div className="flex bg-purple-50 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-purple-700">
              AI Mentor Chat
            </h1>

            {messages.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={exportAsTxt}
                  className="flex items-center gap-2 bg-white border border-purple-300 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-xl transition text-sm"
                >
                  <FaFileAlt />
                  Export TXT
                </button>

                <button
                  onClick={exportAsPdf}
                  className="flex items-center gap-2 bg-white border border-purple-300 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-xl transition text-sm"
                >
                  <FaFilePdf />
                  Export PDF
                </button>
              </div>
            )}
          </div>

          {/* Suggested Questions */}

          {messages.length === 0 && (

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">

              <h2 className="text-xl font-bold text-purple-700 mb-4">
                💡 Suggested Questions
              </h2>

              <div className="grid grid-cols-2 gap-4">

                {suggestions.map((item, index) => (

                  <button
                    key={index}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("suggestion-selected", {
                          detail: item,
                        })
                      )
                    }
                    className="text-left p-4 bg-purple-100 hover:bg-purple-200 rounded-xl transition"
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>

          )}

          <div className="bg-white rounded-2xl shadow-xl h-[75vh] flex flex-col">

            <ChatBox
              messages={messages}
              loading={loading}
            />

            <ChatInput
              setMessages={setMessages}
              setLoading={setLoading}
              conversationId={conversationId}
              setConversationId={setConversationId}
            />

          </div>

        </main>

      </div>

    </div>
  );
}

export default Chat;
