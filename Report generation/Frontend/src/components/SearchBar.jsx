import { memo } from "react";
import { FiSearch } from "react-icons/fi";
function SearchBar({ value, onChange, placeholder = "Search students..." }) {
  return <label className="relative block"><FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" /></label>;
}
export default memo(SearchBar);
