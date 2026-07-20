import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import PdfList from "../components/PdfList";
import { FaFilePdf, FaBrain, FaRobot } from "react-icons/fa";

function Upload() {
  return (
    <div className="flex bg-purple-50 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-purple-700">
              Upload Study Notes
            </h1>

            <p className="text-gray-600 mt-2">
              Upload your PDFs and let AI Mentor answer questions based on your notes.
            </p>
          </div>

          {/* Upload Area */}
          <UploadBox />

          {/* Uploaded PDFs List */}
          <PdfList />

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-10">

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <FaFilePdf
                size={40}
                className="text-red-500"
              />

              <h2 className="text-xl font-bold mt-4">
                Upload PDFs
              </h2>

              <p className="text-gray-600 mt-2">
                Upload lecture notes, books, assignments and study material.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <FaBrain
                size={40}
                className="text-purple-600"
              />

              <h2 className="text-xl font-bold mt-4">
                AI Processing
              </h2>

              <p className="text-gray-600 mt-2">
                AI Mentor reads your documents and understands the content automatically.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <FaRobot
                size={40}
                className="text-green-500"
              />

              <h2 className="text-xl font-bold mt-4">
                Ask Questions
              </h2>

              <p className="text-gray-600 mt-2">
                Chat with your uploaded notes just like talking to your own personal tutor.
              </p>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default Upload;
