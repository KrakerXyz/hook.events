
<template>
   <div class="d-flex flex-column h-100">
      <nav class="navbar navbar-dark bg-dark">
         <router-link
            :to="{name: 'home'}"
            class="navbar-brand cursive"
         >Hook.Events</router-link>
         <div id="nav-portal"></div>
         <div class="navbar-nav">
            <router-link
               :to="{name: 'docs'}"
               class='nav-link'
            >Docs</router-link>
         </div>
      </nav>
      <div class="flex-grow-1 overflow-auto">
         <router-view></router-view>
      </div>
   </div>
</template>

<script lang="ts">
   import { defineComponent } from 'vue';

   export default defineComponent({
      setup() {
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
