import { Hook } from 'hook-events/types';

export function useHookStore() {

   const storageKey = 'hooks';

   const hooks: Hook[] = JSON.parse(localStorage.getItem(storageKey) ?? '[]');

   return {
      get hooks(): readonly Hook[] {
         return Object.freeze([...hooks]);
      },
      removeHookId(hookId: string) {
         const i = hooks.findIndex(h => h.id === hookId);
         if (i === -1) { return; }
         hooks.splice(i, 1);
         localStorage.setItem(storageKey, JSON.stringify(hooks));
      },
      addHook(hook: Hook) {
         const i = hooks.findIndex(h => h.id === hook.id);
         if (i !== -1) {
            console.warn('Hook did not exist');
            return;
         }
         hooks.push(hook);
         localStorage.setItem(storageKey, JSON.stringify(hooks));
      }
   };

}