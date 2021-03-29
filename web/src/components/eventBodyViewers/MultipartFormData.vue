
<template>
   <div>
      <teleport to="#event-view-body-header-portal">
         <button
            class="btn btn-link p-0"
            @click="toggleView"
         >Show {{(view === 'raw'?'Parsed':'Raw (slow)')}}</button>
      </teleport>
      <textarea
         v-if="view === 'raw'"
         :value="rawBody"
         class="form-control"
         rows="15"
      ></textarea>
      <div
         v-if="view === 'parsed' && parsedBody"
         class="list-group"
      >
         <div
            class="list-group-item"
            v-for="part of parsedBody"
            :key="part"
         >
            <div class="row">
               <div class="col-auto">
                  <span class="font-weight-bold">{{part.meta.name}}</span>
               </div>
               <div
                  class="col-auto"
                  v-if="part.meta.fileName"
               >
                  {{part.meta.fileName}}
               </div>
               <div
                  class="col-auto"
                  v-if="part.meta.fileName"
               >
                  <button
                     class="btn btn-link p-0"
                     @click="downloadPart(part)"
                  >Download</button>
               </div>

            </div>
            <div
               class="row mt-3"
               v-if="!part.meta.fileName"
            >
               <div class="col font-monospace">
                  {{part.data}}
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { saveBlob } from '@/services/saveBlob';
   import { computed, defineComponent, ref } from 'vue';

   export default defineComponent({
      props: {
         body: { type: String, required: true },
         contentType: { type: String }
      },
      setup(props) {

         const view = ref<'raw' | 'parsed'>('parsed');

         const toggleView = () => {
            view.value = (view.value === 'parsed' ? 'raw' : 'parsed');
         };

         const rawBody = computed(() => {
            return atob(props.body);
         });

         const parsedBody = computed(() => {

            //https://tools.ietf.org/html/rfc7578

            if (!props.body) { return []; }

            let boundary = (props.contentType?.match(/boundary=(.+)\b/) ?? [])[1];
            if (!boundary) { return null; }

            const decodedBody = atob(props.body);

            //...are delimited with aboundary delimiter, constructed using CRLF, "--", and the value of the "boundary" parameter
            //I tried putting te \r\n in here alongside the -- but then the first part is missing because it does not start with \r\n
            const splitParts = decodedBody.split('--' + boundary).filter(x => !!x && x !== '--\r\n');

            const dataParts: Part[] = splitParts.map(p => {
               const splitData = p.split('\r\n\r\n');
               console.assert(splitData.length === 2);
               console.assert(splitData[0]!.startsWith('\r\n'));
               console.assert(splitData[1]!.endsWith('\r\n'));

               const meta = splitData[0]!.substring(2);

               const metaLines = meta.split('\r\n');
               let name: string | null = null;
               let fileName: string | null = null;
               let contentType: string | null = null;

               for (let i = 0; i < metaLines.length; i++) {
                  const ml = metaLines[i]!;
                  if (i === 0) {
                     name = (ml.match(/\bname="(.+?)"/) ?? [])[1] ?? null;
                     fileName = (ml.match(/\bfilename="(.+?)"/) ?? [])[1] ?? null;
                  } else if (ml.includes('Content-Type')) {
                     contentType = (ml.match(/Content-Type:\s?(.+)$/) ?? [])[1] ?? null;
                  }

                  //If we got the content type, any other possible header fields are irrelevant to us
                  if (!i && contentType) { break; }
               }

               const data = splitData[1]!.substring(0, splitData[1]!.length - 2);

               return { meta: { name, fileName, contentType }, data };
            });

            return dataParts;
         });

         const downloadPart = (part: Part) => {
            const bytes = new Uint8Array(part.data.length);
            for (var i = 0; i < part.data.length; i++) { bytes[i] = part.data.charCodeAt(i); }
            const blob = new Blob([bytes], { type: part.meta.contentType ?? undefined });
            saveBlob(blob, part.meta.fileName ?? undefined);
         };

         return { rawBody, parsedBody, view, toggleView, downloadPart };
      }
   });

   interface Part {
      data: string;
      meta: {
         name: string | null;
         fileName: string | null;
         contentType: string | null;
      };
   }

</script>
