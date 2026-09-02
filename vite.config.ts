import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const isValidKey = (key?: string) =>
  Boolean(
    key &&
      !key.includes('...') &&
      !key.includes('your-') &&
      !key.includes('placeholder') &&
      key.trim().length > 20
  );

const isValidUrl = (url?: string) =>
  Boolean(
    url &&
      !url.includes('your-project-ref') &&
      !url.includes('...') &&
      url.trim().startsWith('https://')
  );

const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const resolvedUrl = isValidUrl(rawUrl) ? rawUrl! : 'https://pcselgjrqixwwededlfm.supabase.co';

const rawKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;
const resolvedKey = isValidKey(rawKey)
  ? rawKey!
  : 'sb_publishable_NgEn6XDMLhCXikU6MuvABA_hy1GNbXO';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(resolvedUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(resolvedKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
