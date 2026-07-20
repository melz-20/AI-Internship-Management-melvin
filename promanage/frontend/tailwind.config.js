/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        // Background surfaces
        surface: {
          DEFAULT: "#F8F9FA", // app background
          card: "#FFFFFF",    // card background
          muted: "#F3F4F6",   // subtle section background
        },
        // Sidebar / primary brand purple
        brand: {
          DEFAULT: "#2D1566",
          dark: "#1E0A3D",
          light: "#3D1F82",
        },
        // Vibrant accent for active states, links, primary buttons
        accent: {
          DEFAULT: "#6366F1",
          hover: "#4F52E0",
          soft: "#EEF0FD",
        },
        // Status colors
        status: {
          completed: "#22C55E",
          completedBg: "#DCFCE7",
          progress: "#38BDF8",
          progressBg: "#E0F2FE",
          overdue: "#EF4444",
          overdueBg: "#FEE2E2",
          dropped: "#F97316",
          droppedBg: "#FFEDD5",
          hold: "#A855F7",
          holdBg: "#F3E8FF",
        },
        ink: {
          DEFAULT: "#111827", // primary text
          soft: "#6B7280",    // secondary text
          faint: "#9CA3AF",   // tertiary text
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        cardHover: "0 4px 12px rgba(16,24,40,0.08)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
