
export function useHookAddress(hookId: string): string {
   return `${process.env.VUE_APP_RECEIVER_SCHEME}://${hookId}.${process.env.VUE_APP_RECEIVER_HOST}`;
}