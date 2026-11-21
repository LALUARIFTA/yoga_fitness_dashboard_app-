module.exports = {
  content: ['./src/index.html', './src/scripts/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          sidebar: '#44b874',
          darkGreen: '#156736',
          cardGreen: '#35ae69',
          mintBg: '#dff5e8',
          mintCard: '#d3f0df',
          offWhite: '#f6f9f8',
          outerBg: '#dce3e1',
          navy: '#1b2246',
          navyLight: '#28325c',
          muted: '#9aa5b1',
        },
      },
    },
  },
};
