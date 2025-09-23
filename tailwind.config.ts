import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}", 
    "./components/**/*.{ts,tsx}", 
    "./app/**/*.{ts,tsx}", 
    "./src/**/*.{ts,tsx}",
    "./src/chains/**/*"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        mylight: {
          "primary": "#c2410c",        // Dark orange
          "primary-content": "#ffffff",
          "secondary": "#f97316",      // Orange
          "secondary-content": "#ffffff", 
          "accent": "#fb923c",         // Light orange
          "accent-content": "#ffffff",
          "neutral": "#374151",
          "neutral-content": "#f9fafb",
          "base-100": "#ffffff",       // Background
          "base-200": "#f9fafb",       // Card background
          "base-300": "#f3f4f6",       // Border/divider
          "base-content": "#111827",   // Text
          "info": "#3b82f6",
          "success": "#10b981", 
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
        mydark: {
          "primary": "#ea580c",        // Bright orange for dark
          "primary-content": "#ffffff",
          "secondary": "#fb923c",      // Light orange
          "secondary-content": "#ffffff",
          "accent": "#fdba74",         // Very light orange
          "accent-content": "#1a1a1a",
          "neutral": "#6b7280",
          "neutral-content": "#f9fafb", 
          "base-100": "#0f172a",       // Dark background
          "base-200": "#1e293b",       // Card background
          "base-300": "#334155",       // Border/divider
          "base-content": "#f1f5f9",   // Text
          "info": "#60a5fa",
          "success": "#34d399",
          "warning": "#fbbf24", 
          "error": "#f87171",
        }
      }
    ],
    darkTheme: "mydark",
    base: true,
    styled: true,
    utils: true,
  },
} satisfies Config;
