import { defineConfig } from 'vite'

// GitHub Pages hosts the built site from a repository subdirectory
// (https://USERNAME.github.io/REPOSITORY/), so all asset URLs must be
// relative rather than absolute.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
  },
})
