
<template>
   <div>
      <teleport to="#event-view-body-header-portal">
         <button
            class="btn btn-link p-0"
            @click="toggleBase64()"
         >{{(isBase64 ? 'Decode from' : 'Encode to')}} Base64</button>
         <button
            class="btn btn-link p-0 ms-4"
            @click="download()"
         >Download as file</button>
      </teleport>
      <textarea
         :value="dispBody"
         class="form-control"
         rows="15"
      ></textarea>
   </div>
</template>

<script lang="ts">

   import { computed, defineComponent, ref } from 'vue';
   import { base64ToBlob } from '@/services/base64ToBlob';
   import { saveBlob } from '@/services/saveBlob';

   export default defineComponent({
      props: {
         body: { type: String, required: true },
         contentType: { type: String }
      },
      setup(props) {

         const isBase64 = ref(false);

         const toggleBase64 = () => {
            isBase64.value = !isBase64.value;
         };

         const dispBody = computed(() => {
            if (isBase64.value) { return props.body; }
            return atob(props.body);
         });

         const download = () => {
            //look into using https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/download
            //I'm hoping I can just create a blob, specifying the content type with it and it'll hadle creating the extension... Maybe...
            const blob = base64ToBlob(props.body, props.contentType ?? null);
            saveBlob(blob);
         };

         return { isBase64, dispBody, toggleBase64, download };
      }
   });

</script>

<style lang="postcss" scoped>
   button {
      vertical-align: text-bottom;
   }
</style>