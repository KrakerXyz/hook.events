
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
                  <div class="row">
                     <div class="col">
                        <h5>{{h.id}}</h5>
                     </div>
                     <div class="col-auto">
                        <small class="text-muted ms-5">{{new Date(h.created).toLocaleString()}}</small>
                        <div class="text-end">
                           <button
                              class="btn btn-link text-danger"
                              @click.prevent="removePublic(h)"
                           >Remove from list</button>
                        </div>
                     </div>
                  </div>
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
               v-if="loginStatus === 'signedOut'"
               class="btn-link"
               @click="signIn()"
            >Sign in with Google</span>

            <span v-if="loginStatus === 'initializing'">
               <v-spinner class="loading"></v-spinner>
            </span>

            <div class="list-group mt-2">
               <template v-if="loginStatus !== 'signedIn'">
                  <div class="list-group-item list-group-item-secondary">Sign In/Up to create private hooks - Hooks only you can access</div>
                  <div class="list-group-item list-group-item-secondary">Organize your hooks by giving them friendly names and descriptions</div>
                  <div class="list-group-item list-group-item-secondary">Delete your hooks and all data they received</div>
               </template>
               <div
                  class="list-group-item list-group-item-secondary"
                  v-if="loginStatus === 'signedIn' && privateHooks && !privateHooks.length"
               >
                  You do not have any private hooks. <span
                     role="button"
                     class="btn-link"
                     @click="createHook()"
                  >Create one</span>
               </div>

               <div
                  class="list-group-item list-group-item-secondary"
                  v-if="loginStatus === 'signedIn' && !privateHooks"
               >
                  <v-spinner></v-spinner>
               </div>

               <template v-if="privateHooks">
                  <router-link
                     v-for="h of privateHooks"
                     :key="h.id"
                     :to="{name: 'hook', params: { hookId: h.id}}"
                     class="list-group-item list-group-item-action"
                  >
                     <div class="row">
                        <div class="col">
                           <h5>
                              {{ h.name || h.id}}
                              <small
                                 v-if="h.name"
                                 class="ms-2 text-muted"
                              >
                                 ({{h.id}})
                              </small>
                           </h5>
                           <div v-if="h.description">
                              {{h.description}}
                           </div>
                        </div>
                        <div class="col-auto">
                           <small class="text-muted ms-5">{{new Date(h.created).toLocaleString()}}</small>
                        </div>
                     </div>
                  </router-link>
               </template>
            </div>
         </div>
      </div>

   </div>
</template>

<script lang="ts">
   import { defineComponent, ref, watch } from 'vue';
   import { useApiClient } from '@/services/useApiClient';
   import { useRouter } from 'vue-router';
   import { useHookStore } from '@/services/useHookStore';
   import { Hook } from 'hook-events';
   import { useLoginService, useLoginStatus } from '@/services/loginService';

   export default defineComponent({
      props: {},
      setup() {

         const apiClient = useApiClient();
         const router = useRouter();

         const hookStore = useHookStore();

         const loginService = useLoginService();
         const loginStatus = useLoginStatus();

         const createHook = async () => {
            const hook = await apiClient.createHook();
            if (!hook.ownerId) { hookStore.addHook(hook); }
            router.push({ name: 'hook', params: { hookId: hook.id } });
         };

         const hooks = ref([...hookStore.hooks].filter(h => !h.ownerId).sort((a, b) => b.created - a.created));

         const removePublic = (hook: Hook) => {
            const index = hooks.value.findIndex(h => h.id === hook.id);
            hookStore.removeHookId(hook.id);
            const newList = [...hooks.value];
            newList.splice(index, 1);
            hooks.value = newList;
         };

         const privateHooks = ref<Hook[] | null>(null);

         watch(loginStatus, () => {
            if (loginStatus.value === 'signedIn') {
               apiClient.getHooks().then(h => {
                  privateHooks.value = [...h].sort((a, b) => b.created - a.created);
               });
            } else if (privateHooks.value?.length) {
               privateHooks.value = [];
            }
         }, { immediate: true });

         return { createHook, hooks, loginStatus, privateHooks, signIn: loginService.signIn, removePublic };
      },
   });
</script>

<style lang="postcss" scoped>
   .btn-create-hook {
      margin: 7rem 0;
      padding: 3rem 6rem;
   }
</style>