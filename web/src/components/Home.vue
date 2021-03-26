
<template>
   <div class="container d-flex flex-column h-100">
      <div class="row">
         <div class="col">
            <h1>Yet another webhook testing tool</h1>
            <p>Create your own webhook receiver that allows you to view incoming http requests in real-time.</p>
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
            <h4>Public hooks created on this machine</h4>
            <div class="list-group mb-3">
               <router-link
                  v-for="h of hooks"
                  :key="h.id"
                  :to="{name: 'hook', params: { hookId: h.id}}"
                  class="list-group-item list-group-item-action"
               >
                  {{h.id}}
                  <small class="text-muted ms-5">{{new Date(h.created).toLocaleString()}}</small>
               </router-link>
            </div>
         </div>
      </div>

      <div class="row">
         <div class="col">
            <h4 class="d-inline">
               Private hooks
            </h4>
            <span
               role="button"
               v-if="!isSignedIn"
               class="btn-link"
            >Sign in with Google</span>
            <div class="list-group mt-2">
               <div
                  class="list-group-item list-group-item-secondary"
                  v-if="!isSignedIn"
               >Sign In/Up to create private hooks - Hooks only you can access</div>
               <div
                  class="list-group-item list-group-item-secondary"
                  v-if="!isSignedIn"
               >Organize your hooks by giving them friendly names and descriptions</div>
               <div
                  class="list-group-item list-group-item-secondary"
                  v-if="!isSignedIn"
               >Delete your hooks and all data they received</div>
               <div
                  class="list-group-item list-group-item-secondary"
                  v-if="isSignedIn && !privateHooks.length"
               >
                  You do not have any private hooks. <span
                     role="button"
                     class="btn-link"
                     @click="createHook()"
                  >Create one</span>
               </div>
               <div
                  v-for="hook of privateHooks"
                  :key="hook.id"
               >
                  <router-link
                     v-for="h of privateHooks"
                     :key="h.id"
                     :to="{name: 'hook', params: { hookId: h.id}}"
                     class="list-group-item list-group-item-action"
                  >
                     {{h.id}}
                     <small class="text-muted ms-5">{{new Date(h.created).toLocaleString()}}</small>
                  </router-link>
               </div>
            </div>
         </div>
      </div>

   </div>
</template>

<script lang="ts">
   import { computed, defineComponent, ref, watch } from 'vue';
   import { useApiClient } from '@/services/useApiClient';
   import { useRouter } from 'vue-router';
   import { useHookStore } from '@/services/useHookStore';
   import { useApiToken } from '@/services/apiToken';
   import { Hook } from 'hook-events';

   export default defineComponent({
      props: {},
      setup() {

         const apiClient = useApiClient();
         const router = useRouter();

         const hookStore = useHookStore();

         const isSignedIn = computed(() => !!apiToken.value);

         const createHook = async () => {
            const hook = await apiClient.createHook();
            if (!hook.ownerId) { hookStore.addHook(hook); }
            router.push({ name: 'hook', params: { hookId: hook.id } });
         };

         const apiToken = useApiToken();

         const hooks = [...hookStore.hooks].filter(h => !h.ownerId).sort((a, b) => b.created - a.created);

         const privateHooks = ref<Hook[]>([]);

         watch(isSignedIn, () => {
            if (isSignedIn.value) {
               apiClient.getHooks().then(h => privateHooks.value = [...h].sort((a, b) => b.created - a.created));
            } else if (privateHooks.value.length) {
               privateHooks.value = [];
            }
         }, { immediate: true });

         return { createHook, hooks, isSignedIn, privateHooks };
      },
   });
</script>

<style lang="postcss" scoped>
   .btn-create-hook {
      margin: 7rem 0;
      padding: 3rem 6rem;
   }
</style>