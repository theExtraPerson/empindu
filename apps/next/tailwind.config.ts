import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],

  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}"
  ],

  theme: {
    extend: {
      colors: {
        /* Core system */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--primary-soft))",
          deep: "hsl(var(--primary-deep))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          soft: "hsl(var(--secondary-soft))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        /* Extended palette */
        clay: {
          light: "hsl(var(--clay-light))",
          medium: "hsl(var(--clay-medium))",
          dark: "hsl(var(--clay-dark))",
        },

        gold: "hsl(var(--kente-gold))",
        "kente-gold": "hsl(var(--kente-gold))",
        copper: "hsl(var(--copper))",
        bark: "hsl(var(--bark-brown))",
        "bark-brown": "hsl(var(--bark-brown))",
        mud: "hsl(var(--mudcloth-black))",
        "warm-cream": "hsl(var(--warm-cream))",
      },

      boxShadow: {
        clay: "var(--shadow-clay)",
        "clay-sm": "var(--shadow-clay-sm)",
        "clay-lg": "var(--shadow-clay-lg)",

        brutal: "var(--shadow-brutalist)",
        "brutal-sm": "var(--shadow-brutalist-sm)",
        "brutal-lg": "var(--shadow-brutalist-lg)",

        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        strong: "var(--shadow-strong)",
        glow: "var(--shadow-glow)",
        gold: "var(--shadow-gold)",
      },

      borderRadius: {
        brutal: "0rem",
        organic: "60% 40% 30% 70% / 60% 30% 70% 40%",
      },

      fontFamily: {
        display: ["var(--font-display)", "Lekton", "monospace"],
        body: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
      },

      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--accent)))",

        "gradient-gold":
          "linear-gradient(135deg, hsl(var(--kente-gold)), hsl(var(--copper)))",
      },

      keyframes: {
        "weave-in": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        "gentle-float": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },

      animation: {
        "weave-in": "weave-in 0.6s ease-out forwards",
        "float": "gentle-float 6s ease-in-out infinite",
      },
    },
  },

  plugins: [],
}

export default config
