
<template>
   <div class="container d-flex flex-column h-100">
      <div class="row">
         <div class="col">
            <h1>Yet another webhook testing tool</h1>
            <p>Create your own webhook receiver that allows you to view incoming requests in real-time.</p>
            <p>Want to be able to react to incoming events within your code? You can do that too, even from behind your firewall. Check out the <router-link :to="{name: 'docs'}">Docs</router-link> for an example</p>
         </div>
      </div>

      <div class="row">
         <div class="col d-flex justify-content-center align-items-center">
            <button
               class="btn btn-primary btn-create-hook"
               @click="createHook()"
            >
               Create Hook
            </button>
         </div>
      </div>

      <div
         v-if="hooks.length"
         class="row"
      >
         <div class="col">
            <p>Your previously created hooks from this machine</p>
            <div class="list-group mb-3">
               <router-link
                  v-for="h of hooks"
                  :key="h.id"
                  :to="{name: 'hook', params: { hookId: h.id}}"
                  class="list-group-item list-group-item-action"
               >
                  {{h.id}}
                  <small class="text-muted ml-5">{{new Date(h.created).toLocaleString()}}</small>
               </router-link>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">
   import { defineComponent } from 'vue';
   import { useApiClient } from '@/services/useApiClient';
   import { useRouter } from 'vue-router';
   import { useHookStore } from '@/services/useHookStore';

   export default defineComponent({
      props: {},
      setup() {

         const apiClient = useApiClient();
         const router = useRouter();

         const hookStore = useHookStore();

         const createHook = async () => {
            const hook = await apiClient.postHook();
            hookStore.addHook(hook);
            router.push({ name: 'hook', params: { hookId: hook.id } });
         };

         const hooks = [...hookStore.hooks].sort((a, b) => b.created - a.created);

         return { createHook, hooks };
      },
   });
</script>

<style lang="postcss" scoped>
   .btn-create-hook {
      margin: 7rem 0;
      padding: 3rem 6rem;
   }
</style>