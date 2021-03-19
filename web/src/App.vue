<template>
   <div class="d-flex flex-column h-100">
      <nav class="navbar navbar-dark bg-dark navbar-expand-sm">

         <div class="container-fluid">

            <router-link
               :to="{name: 'home'}"
               class="navbar-brand cursive"
            >Hook.Events</router-link>

            <div id="nav-portal"></div>

            <ul class="navbar-nav">
               <li class="nav-item">
                  <router-link
                     :to="{name: 'docs'}"
                     class='nav-link'
                  >Docs</router-link>
               </li>
               <li class="nav-item">
                  <button
                     id="btn-google"
                     class="btn btn-link nav-link"
                  >Sign In/Up</button>
               </li>
            </ul>

         </div>

      </nav>

      <div class="flex-grow-1 overflow-auto">
         <router-view></router-view>
      </div>

   </div>
</template>

<script lang="ts">
   import { defineComponent, onMounted } from 'vue';

   /* eslint-disable no-undef */

   export default defineComponent({
      setup() {

         if (process.env['NODE_ENV'] !== 'development') {

            const clarity = document.createElement('script');
            clarity.innerText = '(function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) }; t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, "clarity", "script", "4iwjk3wxd1");';
            document.head.appendChild(clarity);

         }

         onMounted(() => {

            gapi.load('auth2', function () {
               // Retrieve the singleton for the GoogleAuth library and set up the client.
               const auth2 = gapi.auth2.init({
                  client_id: process.env['VUE_APP_GOOGLE_CLIENT_ID'],
                  cookie_policy: 'single_host_origin',
                  fetch_basic_profile: true
               });

               if (auth2.isSignedIn) {
                  console.log('Already signed in');
                  auth2.currentUser.listen(user => {
                     const profile = user.getBasicProfile();
                     console.log('email', profile.getEmail());
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
                     });

               }

            });

         });

         return {};
      },
   });
</script>

<style lang="postcss">
   @import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap");

   .cursive {
      font-family: "Dancing Script", cursive;
   }
</style>

<style lang="postcss" scoped>
   .navbar-brand {
      font-size: 2.25rem;
      text-transform: lowercase;
      line-height: 1rem;
   }
</style>
