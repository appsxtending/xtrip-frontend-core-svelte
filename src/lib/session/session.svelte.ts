import type { SessionView } from '@xtrip/web-runtime/types';
/** Component-owned safe session metadata; never stores credentials or a global cache. */
export function sessionPresentation(initial: SessionView) {
  let current = $state(initial);
  return {
    get current() {
      return current;
    },
    replace(next: SessionView) {
      current = next;
    },
  };
}
