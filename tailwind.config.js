/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#071528",
          900: "#0B2545",
          800: "#123A63",
          700: "#1B4E80",
          600: "#2563A3",
        },
        offwhite: "#F7F8FA",
      },
    },
  },
  plugins: [],
};
