
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
               'badge-success': props.method === 'GET',
               'badge-primary': props.method === 'POST',
               'badge-warn': props.method === 'PUT',
               'badge-danger': props.method === 'DELETE'
            };
         });
         return { badgeClass };
      }
   });

</script>
