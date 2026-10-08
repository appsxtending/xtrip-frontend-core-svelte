// @vitest-environment node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';
it('renders every workbench family in Node without browser globals', async () => {
  const code = `import {createServer} from 'vite';import {svelte} from '@sveltejs/vite-plugin-svelte';import {resolve} from 'node:path';const virtual=resolve('virtual-ssr-entry.js').split(String.fromCharCode(92)).join('/');
 const server=await createServer({configFile:false,plugins:[svelte({configFile:false,compilerOptions:{runes:true}}),{name:'ssr-fixture-entry',resolveId(id){if(id==='virtual:ssr-entry')return virtual;},load(id){if(id===virtual)return "import {render} from 'svelte/server'; const modules=import.meta.glob('/src/workbench/*.stories.svelte',{eager:true}); export function renderAll(){let count=0;for(const [path,module] of Object.entries(modules)){const html=render(module.default,{props:{locale:'ar',state:'loaded'}}).body;if(!html)throw Error(path);count++;}return count;}";}}],server:{middlewareMode:true},appType:'custom'});
 try{const entry=await server.ssrLoadModule('virtual:ssr-entry');console.log('SSR_FAMILIES='+entry.renderAll());}finally{await server.close();}`;
  const result = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', code], {
    cwd: process.cwd(),
    timeout: 90_000,
    maxBuffer: 2_000_000,
  });
  expect(result.stdout).toContain('SSR_FAMILIES=37');
}, 100_000);
