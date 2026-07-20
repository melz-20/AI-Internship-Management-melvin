import { useRef, useState } from "react";
import axios from "axios";
import {
  FaCloudUploadAlt,
  FaFilePdf,
  FaTimes,
  FaUpload,
} from "react-icons/fa";

function UploadBox() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    setSelectedFile(file);
    setMessage("");
    setProgress(0);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setMessage("");
    setProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadPDF = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("❌ You must be logged in to upload.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },

          onUploadProgress: (event) => {
            const percent = Math.round(
              (event.loaded * 100) / event.total
            );

            setProgress(percent);
          },
        }
      );

      setMessage("✅ " + response.data.message);

    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        setMessage("❌ Session expired. Please log in again.");
      } else {
        setMessage("❌ Upload Failed!");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-10">

      <div className="border-4 border-dashed border-purple-300 rounded-3xl p-12 text-center hover:border-purple-500 transition">

        <FaCloudUploadAlt
          size={70}
          className="mx-auto text-purple-600"
        />

        <h2 className="text-3xl font-bold mt-6 text-purple-700">
          Upload Study Notes
        </h2>

        <p className="text-gray-500 mt-3">
          Upload your PDF notes and let AI Mentor learn from them.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelect}
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl transition"
        >
          Browse PDF
        </button>

        <p className="text-sm text-gray-400 mt-4">
          Supported Format: PDF
        </p>

        {selectedFile && (
          <div className="mt-8 bg-purple-50 rounded-2xl p-6 shadow">

            <div className="flex justify-between items-center">

              <div className="flex gap-4 items-center">

                <FaFilePdf
                  size={40}
                  className="text-red-500"
                />

                <div className="text-left">
                  <p className="font-semibold">
                    {selectedFile.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

              </div>

              <button
                onClick={removeFile}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>

            </div>

            {uploading && (
              <div className="mt-6">

                <div className="w-full bg-gray-300 rounded-full h-3">

                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                    }}
                  ></div>

                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Uploading... {progress}%
                </p>

              </div>
            )}

            <button
              onClick={uploadPDF}
              disabled={uploading}
              className={`mt-6 w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white transition ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FaUpload />

              {uploading ? "Uploading..." : "Upload PDF"}

            </button>

            {message && (
              <p className="mt-4 font-semibold text-center">
                {message}
              </p>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default UploadBox;
