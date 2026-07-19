import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
function Activity() { return <div className="flex min-h-screen bg-[#F8FAFC]"><Sidebar /><main className="min-w-0 flex-1 p-4 md:p-6"><Navbar /><section className="mt-7 rounded-xl border border-slate-100 bg-white p-6 shadow-sm"><h1 className="text-3xl font-bold tracking-tight">Recent activity</h1><p className="mt-2 text-slate-500">Student record activity will appear here as updates are made.</p></section></main></div>; }
export default Activity;
