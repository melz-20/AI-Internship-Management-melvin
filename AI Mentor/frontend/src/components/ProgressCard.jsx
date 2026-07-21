function ProgressCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-10">

      <h2 className="text-2xl font-bold text-purple-700">
        Learning Progress
      </h2>

      <div className="mt-6">

        <div className="mb-5">
          <div className="flex justify-between">
            <span>Python</span>
            <span>90%</span>
          </div>

          <div className="bg-gray-200 rounded-full h-3 mt-2">
            <div className="bg-purple-600 h-3 rounded-full w-[90%]"></div>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between">
            <span>Java</span>
            <span>75%</span>
          </div>

          <div className="bg-gray-200 rounded-full h-3 mt-2">
            <div className="bg-blue-500 h-3 rounded-full w-3/4"></div>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between">
            <span>Machine Learning</span>
            <span>45%</span>
          </div>

          <div className="bg-gray-200 rounded-full h-3 mt-2">
            <div className="bg-green-500 h-3 rounded-full w-[45%]"></div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default ProgressCard;