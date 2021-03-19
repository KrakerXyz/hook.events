
<template>
   <div>
      <teleport to="#event-view-body-header-portal">
         <div
            class="btn-group ms-3"
            role="group"
         >
            <button
               type="button"
               class="btn"
               :class="{'btn-primary': view === 'raw', 'btn-light': view !== 'raw' }"
               @click="view = 'raw'"
            >Raw</button>
            <button
               type="button"
               class="btn"
               :class="{'btn-primary': view === 'json', 'btn-light': view !== 'json' }"
               @click="view = 'json'"
            >Json</button>
            <button
               type="button"
               class="btn"
               :class="{'btn-primary': view === 'list', 'btn-light': view !== 'list' }"
               @click="view = 'list'"
            >List</button>
         </div>
      </teleport>
      <textarea
         v-if="view === 'raw'"
         :value="rawBody"
         class="form-control"
         rows="15"
      ></textarea>
      <pre v-else-if="view === 'json'"><code>{{jsonBody}}</code></pre>
      <div
         v-else
         class="row"
      >
         <div class="col">
            <div class="list-group">
               <div
                  class="list-group-item"
                  v-for="p of listBody"
                  :key="p"
               >
                  <span class="font-weight-bold">{{p.key}}</span>: {{p.value}}
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { computed, defineComponent, ref } from 'vue';

   export default defineComponent({
      props: {
         body: { type: String, required: true }
      },
      setup(props) {

         const view = ref<'raw' | 'list' | 'json'>('raw');

         const rawBody = computed(() => atob(props.body));

         const objBody = computed(() => {
            const pairs = rawBody.value.split('&');
            const obj: Record<string, string | string[]> = {};
            for (const p of pairs) {
               const kvp = p.split('=');
               const key = decodeURIComponent(kvp[0]!);
               const value = decodeURIComponent(kvp[1]!);
               if (obj[key] !== undefined) {
                  let existingValue = obj[key]!;
                  if (!Array.isArray(existingValue)) { existingValue = [existingValue]; }
                  obj[key] = [...existingValue, value];
               } else {
                  obj[key] = value;
               }
            }
            return obj;
         });

         const jsonBody = computed(() => {
            return JSON.stringify(objBody.value, null, 3);
         });

         const listBody = computed(() => {
            const pairs: { key: string, value: string }[] = [];
            for (const key of Object.getOwnPropertyNames(objBody.value)) {
               const value = objBody.value[key]!;
               if (Array.isArray(value)) {
                  for (const v of value) {
                     pairs.push({ key, value: v });
                  }
               } else {
                  pairs.push({ key, value });
               }
            }
            return pairs;
         });

         return { rawBody, view, jsonBody, listBody };
      }
   });

</script>
