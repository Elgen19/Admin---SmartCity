/** @type {import('tailwindcss').Config} */
module.exports = {
  "content": [
      "./src/**/*.{js,jsx,ts,tsx}"
  ],
  "theme": {
      "extend": {
          "colors": {
              "white": "#fff",
              "darkturquoise": "#09d1e3",
              "gainsboro": "rgba(217, 217, 217, 0)",
              "gray": {
                  "100": "rgba(30, 30, 30, 0.7)",
                  "200": "rgba(0, 0, 0, 0.3)"
              }
          },
          "spacing": {},
          "fontFamily": {
              "nunito": "Nunito"
          }
      },
      "fontSize": {
          "21xl": "48px",
          "xl": "20px",
          "sm": "14px",
          "lg": "18px",
          "inherit": "inherit"
      }
  },
  "corePlugins": {
      "preflight": false
  }
}