import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaFilePdf,
  FaTrash,
  FaDownload,
} from "react-icons/fa";

function StudyMaterial() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/uploads/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFiles(response.data);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Delete this PDF?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://127.0.0.1:8000/uploads/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFiles(files.filter((file) => file.id !== id));

      alert("PDF deleted successfully.");
    } catch (error) {
      console.log(error);
      alert("Could not delete PDF.");
    }
  };

  const downloadFile = (id) => {
    const token = localStorage.getItem("token");

    window.open(
      `http://127.0.0.1:8000/uploads/download/${id}?token=${token}`,
      "_blank"
    );
  };

  return (
    <div className="flex bg-purple-50 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">

          <h1 className="text-4xl font-bold text-purple-700 mb-8">
            Study Material
          </h1>

          {loading ? (
            <h2 className="text-xl text-purple-600">
              Loading PDFs...
            </h2>
          ) : files.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
              <FaFilePdf
                className="mx-auto text-red-500 mb-5"
                size={60}
              />

              <h2 className="text-2xl font-bold">
                No PDFs Uploaded
              </h2>

              <p className="text-gray-500 mt-3">
                Upload your first study note.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {files.map((file) => (

                <div
                  key={file.id}
                  className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center"
                >

                  <div className="flex items-center gap-5">

                    <FaFilePdf
                      className="text-red-500"
                      size={35}
                    />

                    <div>
                      <h2 className="font-bold text-lg">
                        {file.filename}
                      </h2>

                      <p className="text-gray-500">
                        File ID : {file.id}
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-4">

                    <button
                      onClick={() => downloadFile(file.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl"
                    >
                      <FaDownload />
                    </button>

                    <button
                      onClick={() => deleteFile(file.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl"
                    >
                      <FaTrash />
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

        </main>

      </div>
    </div>
  );
}

export default StudyMaterial;