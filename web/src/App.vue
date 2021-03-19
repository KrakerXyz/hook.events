
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
                     class="btn btn-link nav-link"
                     @click="signin"
                  >Sign In</button>
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
   import { defineComponent } from 'vue';

   declare var google: any;

   export default defineComponent({
      setup() {

         const signin = () => {

            google.accounts.id.initialize({
               client_id: process.env['VUE_APP_GOOGLE_CLIENT_ID'],
               callback: (resp: any) => {
                  console.log('google-login-response', resp);
               }
            });

            google.accounts.id.prompt((notification: any) => {
               console.log('google-notification', notification);
               const moment: 'display' = notification.getMomentType();

               if (moment === 'display') {
                  const isDisplayed = notification.isDisplayed();
                  if (!isDisplayed) {
                     const reason = notification.getNotDisplayedReason();
                     console.warn(`Failed to display signin - ${reason}`);
                  }

                  return;
               }

               console.warn(`Unknown moment - ${moment}`);

            });

         };

         return { signin };
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
