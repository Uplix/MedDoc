module.exports = {
  plugins: {
    // We explicitly tell the v4 PostCSS plugin where to find our custom config file.
    "@tailwindcss/postcss": {
      config: './tailwind.config.cjs', 
    },
    autoprefixer: {},
  },
}
