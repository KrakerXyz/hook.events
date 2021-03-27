
<template>
   <div>
      {{hook.name || hook.id}}
   </div>
</template>

<script lang="ts">

   import { Hook } from 'hook-events';
   import { defineComponent } from 'vue';

   export default defineComponent({
      props: {
         hook: { type: Object as () => Hook, required: true }
      },
      setup() {
         return {};
      }
   });

</script>
