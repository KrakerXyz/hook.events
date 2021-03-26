import { GoogleToken } from 'hook-events';
import { ref } from 'vue';
import { useApiClient } from './useApiClient';

let user: gapi.auth2.GoogleUser | null = null;
const apiToken = ref<string | null>(null);
const avatarUrl = ref<string | null>(null);
const loginStatus = ref<'signedOut' | 'initializing' | 'signedIn'>('initializing');

function init(): Promise<void> {

   return new Promise<void>(r => {

      const client_id = process.env['VUE_APP_GOOGLE_CLIENT_ID'];
      loginStatus.value = 'initializing';
      gapi.load('auth2', () => {
         gapi.auth2.init({
            client_id,
            cookie_policy: 'single_host_origin',
            fetch_basic_profile: true
         }).then(
            auth2 => {

               if (auth2.isSignedIn.get()) {
                  const googleUser = auth2.currentUser.get();
                  verifyToken(googleUser, auth2)
                     .then(u => user = u)
                     .finally(() => r());
               } else {
                  loginStatus.value = 'signedOut';
                  r();
               }

            },
            e => {
               console.debug('Failed to initialize gapi', e);
               loginStatus.value = 'signedOut';
               r();
            }
         );

      });

   });
}

async function verifyToken(googleUser: gapi.auth2.GoogleUser, auth2: gapi.auth2.GoogleAuth): Promise<gapi.auth2.GoogleUser> {

   const authResponse = googleUser.getAuthResponse();

   const googleToken: GoogleToken = {
      idToken: authResponse.id_token
   };

   try {

      const apiClient = useApiClient();
      const newApiToken = await apiClient.getTokenFromGoogle(googleToken);

      apiToken.value = newApiToken.token;
      avatarUrl.value = googleUser.getBasicProfile().getImageUrl();
      loginStatus.value = 'signedIn';

      return googleUser;

   } catch {
      auth2.signOut();
      throw new Error('Error validating token');
   }
}

let intiProm: Promise<void> = init();

async function signIn(): Promise<void> {
   await intiProm;
   if (user) { return; }
   const auth2 = gapi.auth2.getAuthInstance();

   loginStatus.value = 'initializing';
   return new Promise<void>(r => {
      auth2.signIn().then(
         googleUser => {
            verifyToken(googleUser, auth2)
               .then(u => user = u)
               .finally(() => r());
         },
         () => {
            console.debug('Signin canceled');
            loginStatus.value = 'signedOut';
            r();
         }
      );
   });
}

async function signOut() {
   await intiProm;
   if (!user) { return; }
   loginStatus.value = 'initializing';
   const auth2 = gapi.auth2.getAuthInstance();
   auth2.signOut().then(() => {
      user = null;
      avatarUrl.value = null;
      apiToken.value = null;
      loginStatus.value = 'signedOut';
      intiProm = init();
   });
}

export function useLoginService() {
   return {
      signIn,
      signOut
   };
}

export function useApiToken() {
   return apiToken;
}

export function useAvatarUrl() {
   return avatarUrl;
}

export function useLoginStatus() {
   return loginStatus;
}