
<template>
   <pre><code>{{strBody}}</code></pre>
</template>

<script lang="ts">

   import { computed, defineComponent } from 'vue';

   export default defineComponent({
      props: {
         body: { type: String, required: true }
      },
      setup(props) {

         const strBody = computed(() => atob(props.body));

         return { strBody };
      }
   });

</script>
