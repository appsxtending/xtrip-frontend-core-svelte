import { presentationContext } from '#lib/ssr/host-policy.server.ts';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = ({ url }) => presentationContext(url);
