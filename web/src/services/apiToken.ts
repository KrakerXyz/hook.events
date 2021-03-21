
let apiToken: string | null = null;
export function setApiToken(token: string) {
   apiToken = token;
}

export function getApiToken(): string | null {
   return apiToken;
}