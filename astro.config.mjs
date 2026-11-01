import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://refugeautonome.com',
  integrations: [sitemap()],
  output: 'static',
});
