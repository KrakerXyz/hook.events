
<template>
   <div
      class="h-100"
      ref="el"
   ></div>
</template>

<script lang="ts">

   import { computed, defineComponent, onMounted, ref } from 'vue';
   import { CodeMirrorLanguage, useCodeMirrorAsync } from '../../services/useCodeMirror';

   export default defineComponent({
      props: {
         body: { type: String, required: true }
      },
      setup(props) {

         const el = ref<HTMLElement | null>(null);

         const strBody = computed(() => {
            const str = atob(props.body);
            try {
               const json = JSON.parse(str);
               const formatted = JSON.stringify(json, null, 3);
               return formatted;
            } catch {
               return str;
            }
         });

         onMounted(() => {
            console.assert(!!el.value);
            useCodeMirrorAsync(el.value!, true, strBody, CodeMirrorLanguage.Json);
         });

         return { el };
      }
   });

</script>
