import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-node';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: adapter(),
      paths: {
        origin:
          process.env.XTRIP_WEB_ORIGIN ??
          (command === 'build' ? 'http://127.0.0.1:4173' : undefined),
      },
      compilerOptions: { runes: true },
      csp: {
        mode: 'nonce',
        directives: {
          'default-src': ['self'],
          'script-src': ['self'],
          'style-src': ['self'],
          'img-src': ['self', 'data:'],
          'font-src': ['self'],
          'connect-src': ['self'],
          'object-src': ['none'],
          'base-uri': ['none'],
          'frame-ancestors': ['none'],
          'form-action': ['self'],
          'require-trusted-types-for': ['script'],
          'trusted-types': ['svelte-trusted-html'],
        },
      },
      csrf: { trustedOrigins: [] },
    }),
  ],
}));
