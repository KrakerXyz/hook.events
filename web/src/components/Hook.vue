
<template>
   <div class="h-100">

      <teleport to="#nav-portal">
         <!-- this rapper div is to keep the items together within nav's justify spacing -->
         <div class="d-flex align-items-center">
            <span class="navbar-text text-monospace text-light d-none d-lg-inline">
               {{hookAddress}}
            </span>
            <span class="navbar-text text-monospace text-light d-lg-none">
               {{hookId}}
            </span>
            <v-button-copy
               :text="hookAddress"
               class="text-light"
            ></v-button-copy>
         </div>
      </teleport>

      <div
         v-if="!events"
         class="h-100 d-flex align-items-center justify-content-center"
      >
         <v-spinner></v-spinner>
      </div>

      <div
         class="container-fluid py-3 h-100"
         v-else-if="events.length"
      >
         <div class="row h-100 no-gutters">
            <div class="col-4 h-100">
               <div class="h-100 d-flex flex-column">
                  <h5>Events</h5>
                  <div class="list-group flex-grow-1 overflow-auto">
                     <router-link
                        class="list-group-item list-group-item-action"
                        v-for="e of events"
                        :key="e.event.id"
                        :to="{ query: {eventId: e.event.id} }"
                        active-class='noop-active'
                        :class="{ 'active': selectedEventId === e.event.id }"
                     >
                        <event-list-item
                           :event="e"
                           @delete="deleteEvent(e)"
                        ></event-list-item>
                     </router-link>
                  </div>
               </div>
            </div>
            <div
               v-if="selectedEvent"
               class="col-8 h-100"
            >
               <div class="h-100 d-flex flex-column">
                  <h5 class="ml-5">Event Details</h5>
                  <event-view
                     class="flex-grow-1 overflow-auto px-5"
                     :event="selectedEvent"
                  ></event-view>
               </div>
            </div>
         </div>
      </div>

      <hook-empty
         v-else
         :hookId="hookId"
      ></hook-empty>

   </div>
</template>

<script lang="ts">
   import { useApiClient } from '@/services/useApiClient';
   import { useHookStore } from '@/services/useHookStore';
   import { Client as ReceiverClient } from 'hook-events/receiver';
   import type { EventDataSlim, Hook } from 'hook-events/types';
   import { computed, defineComponent, onUnmounted, ref, watch } from 'vue';
   import type { EventDataVm } from './EventDataVm';
   import EventListItem from './EventListItem.vue';
   import { useHookAddress } from '@/services/useHookAddress';
   import HookEmpty from './HookEmpty.vue';
   import { useRoute, useRouter } from 'vue-router';
   import EventView from './EventView.vue';

   export default defineComponent({
      components: {
         EventListItem,
         HookEmpty,
         EventView
      },
      props: {
         hookId: { type: String, required: true }
      },
      setup(props) {

         const route = useRoute();
         const router = useRouter();

         const hookAddress = useHookAddress(props.hookId);

         const hookStore = useHookStore();

         const hookRef = ref<Hook | null>(hookStore.hooks.find(h => h.id === props.hookId) ?? null);

         const apiClient = useApiClient();

         if (!hookRef.value) {
            apiClient.getHook(props.hookId).then(h => hookRef.value = h);
         }

         let receiver: ReceiverClient | null = null;

         let events = ref<EventDataVm[] | null>(null);

         //Used to require at least 400ms loading time to prevent flickering
         const startTime = Date.now();
         const minLoadTime = 500;

         watch(hookRef, h => {

            if (!h) {
               receiver?.dispose();
               receiver = null;
               return;
            }

            receiver = new ReceiverClient(useHookAddress(props.hookId));

            receiver.onEvent(e => {
               //converting to a slim event to conserve memory
               const { body, ...other } = e;
               const slim: EventDataSlim = { ...other, hasBody: !!body };
               if (!events.value) { events.value = []; }
               events.value.unshift({
                  event: slim,
                  body: body
               });
            });

            const hookId = props.hookId;
            apiClient.getHookEvents(props.hookId).then(slims => {

               setTimeout(() => {
                  if (props.hookId !== hookId) {
                     console.warn('Hookid changed');
                     return;
                  }
                  events.value = slims.map(s => {
                     const vm: EventDataVm = {
                        event: s,
                        body: null
                     };
                     return vm;
                  });

               }, minLoadTime - (Date.now() - startTime));
            });

         }, { immediate: true });

         const selectedEventId = computed(() => route.query.eventId ?? null as string | null);

         const selectedEvent = computed(() => events.value?.find(e => e.event.id === selectedEventId.value)?.event ?? null);

         const deleteEvent = (e: EventDataVm) => {
            if (selectedEventId.value === e.event.id) { router.replace({ query: { ...route.query, eventId: undefined } }); }
            const eventIndex = events.value?.indexOf(e) ?? -1;
            console.assert(eventIndex !== -1);
            apiClient.deleteEvent(e.event.id);
            events.value!.splice(eventIndex, 1);
         };

         onUnmounted(() => {
            receiver?.dispose();
         });

         return { events, hookAddress, selectedEventId, selectedEvent, deleteEvent };
      }
   });
</script>

<style lang="postcss" scoped>
   .fa-asterisk.fa-spin {
      font-size: 12rem;
   }
</style>