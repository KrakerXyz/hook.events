
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

   import { defineComponent, onMounted, ref } from 'vue';

   //We have gapi listed in tsconfig and the typings are present but vetur is still complaining.
   /* eslint-disable no-undef */

   export default defineComponent({
      setup() {

         const user = ref<User | null>(null);

         onMounted(() => {

            gapi.load('auth2', function () {
               // Retrieve the singleton for the GoogleAuth library and set up the client.
               const auth2 = gapi.auth2.init({
                  client_id: process.env['VUE_APP_GOOGLE_CLIENT_ID'],
                  cookie_policy: 'single_host_origin',
                  fetch_basic_profile: true
               });

               if (auth2.isSignedIn) {

                  user.value = {
                     status: 'loading',
                     avatarUrl: null
                  };

                  auth2.currentUser.listen(googleUser => {
                     const profile = googleUser.getBasicProfile();
                     user.value = {
                        status: 'loaded',
                        avatarUrl: profile.getImageUrl()
                     };
                  });

               } else {
                  auth2.attachClickHandler(
                     document.getElementById('btn-google'),
                     {},
                     (user) => {
                        console.log('success', user);
                     },
                     (reason) => {
                        console.log('fail', reason);
                     }
                  );
               }

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