import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRobot,
  FaChevronRight,
  FaClock,
  FaTrash,
} from "react-icons/fa";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/history/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(response.data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const openConversation = (conversationId) => {
    navigate(`/chat?conversation_id=${conversationId}`);
  };

  const deleteConversation = async (conversationId, event) => {
    // Stop the click from also triggering openConversation
    event.stopPropagation();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://127.0.0.1:8000/history/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory((prev) =>
        prev.filter((item) => item.id !== conversationId)
      );

      toast.success("Conversation deleted successfully.");

    } catch (error) {
      console.error(error);
      toast.error("Failed to delete conversation.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex bg-purple-50 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">

          <h1 className="text-4xl font-bold text-purple-700 mb-8">
            Chat History
          </h1>

          {loading ? (
            <div className="text-center text-purple-600 text-xl mt-20">
              Loading chat history...
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">

              <FaRobot
                size={60}
                className="mx-auto text-purple-500 mb-5"
              />

              <h2 className="text-2xl font-bold text-purple-700">
                No Chats Yet
              </h2>

              <p className="text-gray-500 mt-3">
                Start chatting with AI Mentor to see your history here.
              </p>

            </div>
          ) : (
            <div className="space-y-5">

              {history.map((conversation) => (

                <div
                  key={conversation.id}
                  onClick={() => openConversation(conversation.id)}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
                >

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-5">

                      <div className="bg-purple-100 p-4 rounded-full">

                        <FaRobot
                          className="text-purple-600"
                          size={22}
                        />

                      </div>

                      <div>

                        <h2 className="font-bold text-lg">
                          {conversation.title}
                        </h2>

                        <p className="text-gray-500 flex items-center gap-2 mt-2">
                          <FaClock />
                          {formatDate(conversation.created_at)}
                          {" · "}
                          {conversation.message_count}{" "}
                          {conversation.message_count === 1
                            ? "message"
                            : "messages"}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-4">

                      <button
                        onClick={(event) =>
                          deleteConversation(conversation.id, event)
                        }
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete Conversation"
                      >
                        <FaTrash size={18} />
                      </button>

                      <FaChevronRight className="text-purple-600" />

                    </div>

                  </div>

                  {conversation.last_message && (
                    <div className="mt-5 border-t pt-4">

                      <p className="text-gray-700 line-clamp-3">
                        {conversation.last_message}
                      </p>

                    </div>
                  )}

                </div>

              ))}

            </div>
          )}

        </main>

      </div>
    </div>
  );
}

export default History;
