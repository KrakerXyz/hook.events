
<template>
   <button
      v-if="!user"
      id="btn-google"
      class="btn btn-link nav-link"
   >Sign In/Up</button>

   <!-- I tried putting the v-if on the spinner but we get a vue error. It should work. Seems like a legitimate bug with vue at the time (3/19/2021). Try again later -->
   <div
      class="nav-link"
      v-if="user && user.status === 'loading'"
   >
      <v-spinner class="loading text-white"></v-spinner>
   </div>

   <img
      class="avatar"
      v-if="user && user.status === 'loaded'"
      :src="user.avatarUrl"
      alt="Signed In"
   >
</template>

<script lang="ts">

   import { useApiClient } from '@/services/useApiClient';
   import { defineComponent, onMounted, ref } from 'vue';
   import type { GoogleToken } from 'hook-events';
   import { setApiToken } from '@/services/apiToken';

   //We have gapi listed in tsconfig and the typings are present but vetur is still complaining.
   /* eslint-disable no-undef */

   export default defineComponent({
      setup() {

         const user = ref<User | null>(null);

         const apiClient = useApiClient();

         const verifyToken = async (googleUser: gapi.auth2.GoogleUser, auth2: gapi.auth2.GoogleAuth): Promise<void> => {

            user.value = {
               status: 'loading',
               avatarUrl: null
            };

            const authResponse = googleUser.getAuthResponse();

            const googleToken: GoogleToken = {
               idToken: authResponse.id_token
            };

            try {

               const apiToken = await apiClient.getTokenFromGoogle(googleToken);
               console.log('apiToken', apiToken.token);

               const profile = googleUser.getBasicProfile();

               user.value = {
                  status: 'loaded',
                  avatarUrl: profile.getImageUrl()
               };

               setApiToken(apiToken.token);

            } catch {
               auth2.signOut();
               user.value = null;
            }
         };

         onMounted(() => {
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

         });

         return { user };
      }
   });

   interface User {
      status: 'loading' | 'loaded';
      avatarUrl: string | null;
   }

</script>

<style lang="postcss" scoped>
   .avatar {
      height: 35px;
      width: auto;
      border-radius: 10%;
   }

   .loading {
      font-size: 2rem;
   }
</style>