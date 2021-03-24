import { Ref, ref } from 'vue';

const apiToken = ref<string | null>(null);
export function setApiToken(token: string | null) {
   apiToken.value = token;
}

export function useApiToken(): Ref<string | null> {
   return apiToken;
}