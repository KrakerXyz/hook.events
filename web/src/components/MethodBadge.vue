
<template>
   <span :class="badgeClass">{{method}}</span>
</template>

<script lang="ts">

   import { computed, defineComponent } from 'vue';

   export default defineComponent({
      props: {
         method: { type: String, required: true }
      },
      setup(props) {
         const badgeClass = computed(() => {
            return {
               'badge': true,
               'border': true,
               'bg-success': props.method === 'GET',
               'bg-primary': props.method === 'POST',
               'bg-warn': props.method === 'PUT',
               'bg-danger': props.method === 'DELETE'
            };
         });
         return { badgeClass };
      }
   });

</script>
