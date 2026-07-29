/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/types/**/*.json"],
  safelist: [
    "md:col-span-4",
    "md:col-span-8",
    "md:col-span-12",
    "md:row-span-1",
    "md:row-span-2",
    "animate-[spin_70s_linear_infinite_reverse]",
    "animate-[spin_90s_linear_infinite]",
    "animate-planned-pulse",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "terminal-green": "var(--terminal-green)",
        "neon-accent": "var(--neon-accent)",
        "encryption-purple": "#4F46E5",
        "surface-base": "var(--stitch-surface-base)",
        "surface-elevated": "var(--stitch-surface-elevated)",
        "surface-container-lowest": "var(--stitch-surface-container-lowest)",
        "surface-variant": "var(--stitch-surface-variant)",
        "border-subtle": "var(--stitch-border-subtle)",
        "on-surface": "var(--stitch-on-surface)",
        "on-surface-variant": "var(--stitch-on-surface-variant)",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        pj:['"PIXymbols Very Loose W01 Reg"', 'sans-serif'],
        body: ['var(--font-hanken-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-hanken-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        inter: ['var(--font-hanken-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'helvetica-97-condensed-oblique': ['"Helvetica Neue LT Pro 97 Black Condensed Oblique"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
        label: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
        headline: ['var(--font-hanken-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        headline: "0.08em",
        label: "0.05em",
      },
      spacing: {
        "margin-mobile": "16px",
        "margin-desktop": "48px",
        gutter: "24px",
        "container-max": "1440px",
      },
      maxWidth: {
        "container-max": "1440px",
      },

    },
  },
  plugins: [require("tailwindcss-animate")],
};
