/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#0B0F1A",
        slate: "#101525",
        mist: "#161B2E",
        glow: "#FF7A00",
        lime: "#B6FF3B",
        cyan: "#3BE3FF",
        ember: "#FFB347",
        rose: "#FF5C7A"
      },
      boxShadow: {
        card: "0 18px 50px rgba(5, 8, 20, 0.45)",
        glow: "0 0 0 1px rgba(255, 122, 0, 0.35), 0 12px 32px rgba(255, 122, 0, 0.18)"
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top, rgba(255,122,0,0.25), transparent 55%), radial-gradient(circle at 20% 40%, rgba(59,227,255,0.2), transparent 50%), linear-gradient(180deg, #0B0F1A 0%, #0F1430 50%, #0B0F1A 100%)",
        "card-gradient":
          "linear-gradient(140deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        "accent-gradient": "linear-gradient(120deg, #FF7A00, #FFB347)"
      }
    }
  },
  plugins: []
};
