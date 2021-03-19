
<template>
   <div class="h-100 container-fluid">
      <div class="row mt-3">
         <div class="col text-monospace">
            <h1>
               <method-badge :method="event.method"></method-badge> {{event.path}}{{queryString}}
            </h1>
         </div>
      </div>
      <div class="row">
         <div class="col">
            From: {{event.ip}}
         </div>
      </div>
      <div class="row mt-3">
         <div class="col">
            <h5>Headers</h5>
         </div>
      </div>
      <div class="row">
         <div class="col">
            <div class="list-group">
               <div
                  class="list-group-item"
                  v-for="headerKey of Object.getOwnPropertyNames(event.headers)"
                  :key="headerKey"
               ><span class="font-weight-bold">{{headerKey}}</span>: <span class="overflow-anywhere">{{event.headers[headerKey]}}</span></div>
            </div>
         </div>
      </div>
      <div
         class="row mt-3"
         v-if="event.hasBody"
      >
         <div class="col">
            <h5>Body
               <span id="event-view-body-header-portal"></span>
               <!-- The spinner is wrapped in a span because we get a vue error when it's not wrapped. Seems to be a bug with vue -->
               <span v-if="isBodyLoading">
                  <v-spinner></v-spinner>
               </span>
            </h5>
            <button
               v-if="!body && !isBodyLoading"
               class="btn btn-primary"
               @click="loadBody"
            >Load the body data</button>
            <component
               v-if="bodyViewer"
               :is="bodyViewer"
               :body="body"
               :contentType="contentType"
            ></component>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { useApiClient } from '@/services/useApiClient';
   import { EventDataSlim } from 'hook-events/types';
   import { computed, defineComponent, ref, watch } from 'vue';
   import * as BodyViewers from './eventBodyViewers';
   import MethodBadge from './MethodBadge.vue';

   export default defineComponent({
      components: { MethodBadge },
      props: {
         event: { type: Object as () => EventDataSlim, required: true }
      },
      setup(props) {

         const bodyRef = ref<string | null>(null);
         const isBodyLoadingRef = ref(false);
         const apiClient = useApiClient();

         const loadBody = async () => {
            isBodyLoadingRef.value = true;
            const body = await apiClient.getEventBody(props.event.id);
            bodyRef.value = body;
            isBodyLoadingRef.value = false;
         };

         watch(() => props.event, () => {
            //Need to reset the component because the event changed
            bodyRef.value = null;
            isBodyLoadingRef.value = false;

            loadBody();
         }, { immediate: true }); //we use immediate to call the loadBody


         const contentType = computed(() => {
            const contentTypeKey = Object.getOwnPropertyNames(props.event.headers).find(k => k.toLowerCase() === 'content-type');
            if (!contentTypeKey) { return null; }
            const contentTypeValue = props.event.headers[contentTypeKey];
            if (!contentTypeValue) { return null; }
            if (Array.isArray(contentTypeValue)) { return contentTypeValue[0] ?? null; }
            return contentTypeValue;
         });

         const queryString = computed(() => {
            if (!props.event.query) { return null; }
            const params: string[] = [];
            for (const key in props.event.query) {
               const encodedKey = encodeURIComponent(key);
               const values = props.event.query[key];
               if (!values) {
                  params.push(`${encodedKey}=`);
               } else if (typeof values === 'string') {
                  params.push(`${encodedKey}=${encodeURIComponent(values)}`);
               } else {
                  for (const value of values) {
                     params.push(`${encodedKey}=${encodeURIComponent(value)}`);
                  }
               }
            }
            if (!params.length) { return null; }
            return `?${params.join('&')}`;
         });

         const bodyViewer = computed(() => {

            if (!bodyRef.value) { return null; }

            if (!contentType.value) { return BodyViewers.Default; }

            if (contentType.value.toLowerCase().startsWith('multipart/form-data')) { return BodyViewers.MultipartFormData; }

            if (contentType.value === 'application/json') { return BodyViewers.JsonBody; }

            if (contentType.value === 'application/x-www-form-urlencoded') { return BodyViewers.FormUrlEncoded; }

            return BodyViewers.Default;

         });

         return { body: bodyRef, isBodyLoading: isBodyLoadingRef, loadBody, contentType, bodyViewer, queryString };
      }
   });

</script>

<style scoped>
   .overflow-anywhere {
      overflow-wrap: anywhere;
   }
</style>