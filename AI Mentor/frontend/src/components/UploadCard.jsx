import { FaCloudUploadAlt } from "react-icons/fa";

function UploadCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-10">

      <div className="flex flex-col items-center">

        <FaCloudUploadAlt
          className="text-purple-600"
          size={70}
        />

        <h2 className="text-2xl font-bold mt-5">
          Upload Your Study Material
        </h2>

        <p className="text-gray-500 mt-2">
          PDF, DOCX and TXT files supported
        </p>

        <input
          type="file"
          className="mt-8"
        />

        <button
          className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl"
        >
          Upload
        </button>

      </div>

    </div>
  );
}

export default UploadCard;