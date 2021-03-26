import { GoogleToken } from 'hook-events';
import { setApiToken, useApiToken } from './apiToken';
import { useApiClient } from './useApiClient';

let loginService: LoginService | null = null;

export function useLoginService(): LoginService {
   if (!loginService) { loginService = new LoginService(); }
   return loginService;
}

class LoginService {

   //We have gapi listed in tsconfig and the typings are present but vetur is still complaining.
   /* eslint-disable no-undef */

   private _initPromise: Promise<gapi.auth2.GoogleAuth> | null = null;
   private readonly _apiToken = useApiToken();

   private init() {
      if (this._initPromise) { return this._initPromise; }
      this._initPromise = new Promise<gapi.auth2.GoogleAuth>(r => {
         const client_id = process.env['VUE_APP_GOOGLE_CLIENT_ID'];
         gapi.load('auth2', () => {

            const auth2 = gapi.auth2.init({
               client_id,
               cookie_policy: 'single_host_origin',
               fetch_basic_profile: true
            });

            auth2.isSignedIn.listen(isSignedIn => {
               if (!isSignedIn) { return; }
               const googleUser = auth2.currentUser.get();
               this.verifyToken(googleUser, auth2);
            });

            r(auth2);
         });
      });
   }

   private async verifyToken(googleUser: gapi.auth2.GoogleUser, auth2: gapi.auth2.GoogleAuth): Promise<gapi.auth2.GoogleUser> {

      const authResponse = googleUser.getAuthResponse();

      const googleToken: GoogleToken = {
         idToken: authResponse.id_token
      };

      try {

         const apiClient = useApiClient();
         const apiToken = await apiClient.getTokenFromGoogle(googleToken);

         setApiToken(apiToken.token);

         return googleUser;

      } catch {
         auth2.signOut();
         throw new Error('Error validating token');
      }
   }

   public get isSignedIn() { return !!this._apiToken.value; }

   /*
   gapi.load('auth2', function () {
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      const client_id = process.env['VUE_APP_GOOGLE_CLIENT_ID'];

      const auth2 = gapi.auth2.init({
         client_id,
         cookie_policy: 'single_host_origin',
         fetch_basic_profile: true
      });

      auth2.isSignedIn.listen(isSignedIn => {
         if (!isSignedIn) { return; }
         const googleUser = auth2.currentUser.get();
         verifyToken(googleUser, auth2);
      });

      auth2.attachClickHandler(
         document.getElementById('btn-google'),
         {},
         () => ({}), //This is for a success callback but we don't need it because the isSignedIn listener will catch it
         reason => {
            console.log('google-signin-failed', reason);
         }
      );

   });
*/
}