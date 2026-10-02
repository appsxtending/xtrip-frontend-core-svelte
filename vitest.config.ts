import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig({
  plugins: [
    // Unit tests exercise pure policy; production SvelteKit enforces this marker.
    {
      name: 'test-server-marker',
      resolveId(id) {
        if (id === '$app/server') return '\0test-server-marker';
      },
      load(id) {
        if (id === '\0test-server-marker') return 'export {}';
      },
    },
    svelte({ configFile: false, compilerOptions: { runes: true } }),
  ],
  resolve: { conditions: ['browser'] },
  test: { include: ['test/**/*.spec.ts'], environment: 'jsdom', setupFiles: ['test/setup.ts'] },
});
