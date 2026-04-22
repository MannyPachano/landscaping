import { defineConfig } from 'astro/config';

// Set SITE in Netlify UI (Site settings → Environment variables) or replace below for production canonical URLs.
const site =
  process.env.URL ||
  process.env.DEPLOY_PRIME_URL ||
  'https://landscapertemplate.netlify.app';

export default defineConfig({
  site,
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
