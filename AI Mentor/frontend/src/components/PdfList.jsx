import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaFilePdf, FaTrash, FaDownload, FaSpinner } from "react-icons/fa";

function PdfList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://127.0.0.1:8000/documents",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setDocuments(response.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Delete this PDF? This can't be undone.")) return;

    setDeletingId(id);

    try {
      await axios.delete(
        `http://127.0.0.1:8000/documents/${id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      toast.success("Document deleted successfully.");

    } catch (error) {
      console.error(error);
      toast.error("Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const downloadDocument = async (id, filename) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/documents/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      toast.error("Failed to download document.");
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
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">
        Your Uploaded PDFs
      </h2>

      {loading && (
        <p className="text-gray-500">Loading documents...</p>
      )}

      {!loading && documents.length === 0 && (
        <p className="text-gray-500">
          No PDFs uploaded yet. Upload one above to get started.
        </p>
      )}

      {!loading && documents.length > 0 && (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border rounded-xl p-4"
            >
              <div className="flex items-center gap-4">
                <FaFilePdf size={30} className="text-red-500" />

                <div>
                  <p className="font-semibold">{doc.filename}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded {formatDate(doc.uploaded_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadDocument(doc.id, doc.filename)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition"
                >
                  <FaDownload />
                  Download
                </button>

                <button
                  onClick={() => deleteDocument(doc.id)}
                  disabled={deletingId === doc.id}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-xl transition"
                >
                  {deletingId === doc.id ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTrash />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PdfList;
