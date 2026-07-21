import { MdTrendingUp } from "react-icons/md";

function WelcomeBanner() {
  return (
    <div className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 rounded-3xl p-8 text-white shadow-lg">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-violet-100 text-lg">
            Welcome Back 👋
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Admin
          </h1>

          <p className="mt-3 text-violet-100 max-w-xl">
            Monitor internship performance, classify students,
            generate reports and analyze progress through one
            intelligent dashboard.
          </p>

        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 w-72">

          <div className="flex justify-between">

            <p>Today's Progress</p>

            <MdTrendingUp size={24} />

          </div>

          <h2 className="text-5xl font-bold mt-4">
            87%
          </h2>

          <div className="w-full bg-white/30 rounded-full h-3 mt-5">

            <div className="bg-white h-3 rounded-full w-[87%]"></div>

          </div>

          <p className="mt-4 text-sm">
            +24 Students Classified Today
          </p>

        </div>

      </div>

    </div>
  );
}

export default WelcomeBanner;