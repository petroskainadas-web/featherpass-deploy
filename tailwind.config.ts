import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - internal Tailwind helper; stable in practice
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        logo: {
          gold: "hsl(var(--logo-gold))",
          steel: "hsl(var(--logo-steel))",
        },
        content: {
         monster: "hsl(var(--monster-color))",
         subclass: "hsl(var(--subclass-color))",
         spell: "hsl(var(--spell-color))",
         item: "hsl(var(--item-color))",                 // keep for compatibility
         magic_item: "hsl(var(--item-color))",           // NEW, mapped to your existing item color
         encounter: "hsl(var(--encounter-color))",       // keep for now, even if obsolete
         subrace: "hsl(var(--subrace-color))",
         npc: "hsl(var(--npc-color))",                   // NEW, white-based token

        },
        article: {
          design: "hsl(var(--design-notes-color))",
          dev: "hsl(var(--dev-diaries-color))",
          art: "hsl(var(--world-building-color))",
          lore: "hsl(var(--lore-essays-color))",
        },
        product: {
          available: "hsl(var(--product-available-color))",
          released: "hsl(var(--product-released-color))",
          kickstarter: "hsl(var(--product-kickstarter-color))",
          development: "hsl(var(--product-development-color))",
          planned: "hsl(var(--product-planned-color))",
        },
        goal: {
          unlocked: "hsl(var(--unlocked-color))",
          locked: "hsl(var(--locked-color))",
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
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-brushed-gold': 'var(--gradient-brushed-gold)',
        'gradient-brushed-steel': 'var(--gradient-brushed-steel)',
      },
      boxShadow: {
        'fantasy': 'var(--shadow-fantasy)',
        'gold-glow': 'var(--shadow-gold-glow)',
        'pulse-glow': 'var(--shadow-pulse-glow)',
        'deep': 'var(--shadow-deep)',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'crimson': ['Crimson Text', 'serif'],
        'dancing': ['Dancing Script', 'cursive'],
        'tangerine': ['Tangerine', 'cursive'],
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
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
      },
      zIndex: {
        'parallax': '0',
        'content': '10',
        'header': '50',
        'footer': '20',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ matchUtilities, theme }) {
      const colors = flattenColorPalette(theme("colors"));
      matchUtilities(
        {
          "outline-text": (value) => ({
            "--tw-text-outline-color": value,
          }),
        },
        { values: colors }
      );
    }),
  ],
} satisfies Config;
