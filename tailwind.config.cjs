module.exports = {
  // CRITICAL: Content array tells Tailwind where to find the class names.
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Colors derived from your designs
        'med-bg-soft': '#F5F8FA',     // Very light gray/blue for backgrounds (Form background)
        'med-header-blue': '#ADD8E6', // Light sky blue for the header/main background
        'med-accent-blue': '#1E90FF', // Vibrant blue for icons/accents/form titles
        'med-card-main': '#6B8EAD',   // Desaturated blue for the login card
        'med-login-red': '#E53E3E',   // Primary red for the login button
        
        // Additional colors derived from your Loading screen image for dot animation
        'med-dot-1': '#3669D9',
        'med-dot-2': '#7893D1',
        'med-dot-3': '#B8BEE9',
        'med-dot-4': '#D9E3F8',
      },
    },
  },
  plugins: [],
}
