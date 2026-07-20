import { FaUser } from "react-icons/fa";

function Avatar({ name, size = "md", className = "" }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-xl", xl: "h-40 w-40 text-5xl" };
  const initials = name?.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <span aria-label={name || "User"} className={`grid shrink-0 place-items-center rounded-full bg-violet-500 font-semibold text-white ${sizes[size] || sizes.md} ${className}`}>{initials || <FaUser aria-hidden="true" />}</span>;
}

export default Avatar;
