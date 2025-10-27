module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: false,
          reduceIdents: false,
          mergeIdents: false,
          discardUnused: false,
          autoprefixer: false,
        }]
      }
    } : {})
  }
}
