import type { Config } from 'tailwindcss';

// Neutral palette only (stone + one muted accent). No colour is tied to a political side.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Type scale (px @16 root): caption 14 · body 16 · body-lg 18 · heading 20 · question 22/26 · title 24/28 · display 32/36.
      // Nothing below 14px. Line-heights are set here so components never need `leading-*`.
      fontSize: {
        caption: ['0.875rem', '1.7'],
        body: ['1rem', '1.85'],
        'body-lg': ['1.125rem', '1.9'],
        heading: ['1.25rem', '1.7'],
        question: ['1.25rem', '1.8'],
        'question-lg': ['1.5rem', '1.8'],
        title: ['1.5rem', '1.6'],
        'title-lg': ['1.75rem', '1.6'],
        display: ['2rem', '1.5'],
        'display-lg': ['2.25rem', '1.5'],
      },
      fontFamily: {
        brand: ['var(--font-yekan-boom)', 'var(--font-vazir)', 'Tahoma', 'system-ui', 'sans-serif'],
        sans: ['var(--font-vazir)', 'Vazir', 'Tahoma', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
