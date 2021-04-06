
<template>
   <v-code-mirror-editor
      :modelValue="strBody"
      readonly="true"
      language="json"
   ></v-code-mirror-editor>
</template>

<script lang="ts">

   import { computed, defineComponent } from 'vue';

   export default defineComponent({
      props: {
         body: { type: String, required: true }
      },
      setup(props) {

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

         return { strBody };
      }
   });

</script>
