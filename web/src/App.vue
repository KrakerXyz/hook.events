<template>
   <div class="d-flex flex-column h-100">
      <nav class="navbar navbar-dark bg-dark navbar-expand-sm">

         <div class="container-fluid">

            <router-link
               :to="{name: 'home'}"
               class="navbar-brand cursive"
            >Hook.Events</router-link>

            <div id="nav-portal"></div>

            <ul class="navbar-nav align-items-center">
               <li class="nav-item">
                  <router-link
                     :to="{name: 'docs'}"
                     class='nav-link'
                  >Docs</router-link>
               </li>
               <li class="nav-item me-3">
                  <a
                     class="nav-link py-0"
                     href="https://github.com/KrakerXyz/hook.events"
                     target="_blank"
                  ><i class="fab fa-github-square fw"></i></a>
               </li>
               <li class="nav-item">
                  <nav-user></nav-user>
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
   import NavUser from './components/NavUser.vue';

   export default defineComponent({
      components: { NavUser },
      setup() {

         if (process.env['NODE_ENV'] !== 'development') {

            const clarity = document.createElement('script');
            clarity.innerText = '(function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) }; t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, "clarity", "script", "4iwjk3wxd1");';
            document.head.appendChild(clarity);

         }

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

   .fa-github-square {
      font-size: 2.5rem;
   }
</style>
