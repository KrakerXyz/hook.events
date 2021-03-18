import { v4 } from 'uuid';

export function newHookId(): string {
   return v4().replace(/-/g, '');
}