
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
                  <button class="btn btn-link nav-link">Sign In</button>
               </li>
            </ul>

         </div>

      </nav>

      <div class="flex-grow-1 overflow-auto">
         <router-view></router-view>
      </div>

      <!-- <div
         id="g_id_onload"
         :data-client_id="clientId"
         data-auto_select="true"
         data-login_uri="https://005c84eba71548c5ac51ee853b95bf77.hook.events"
      ></div> -->

   </div>
</template>

<script lang="ts">
   import { defineComponent } from 'vue';
   import ButtonCopy from './components/global/ButtonCopy.vue';

   export default defineComponent({
      components: { ButtonCopy },
      setup() {
         const clientId = process.env['VUE_APP_GOOGLE_CLIENT_ID'];
         return { clientId };
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
