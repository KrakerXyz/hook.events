
<template>
   <div>
      <div class="row">
         <div class="col">
            <method-badge :method="event.event.method"></method-badge>
            <span class="ml-3 text-monospace font-weight-bold">{{event.event.path}}</span>
         </div>
         <div class="col-auto">
            <v-button-delete @click.prevent="deleteItem"></v-button-delete>
         </div>
      </div>
      <div class="row">
         <div class="col">
            <small>{{createdString}}</small>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { defineComponent } from 'vue';
   import { EventDataVm } from './EventDataVm';
   import MethodBadge from './MethodBadge.vue';

   export default defineComponent({
      components: { MethodBadge },
      props: {
         event: { type: Object as () => EventDataVm, required: true }
      },
      emits: {
         delete: () => true
      },
      setup(props, { emit }) {
         const createdString = new Date(props.event.event.created).toLocaleString();

         const deleteItem = () => {
            emit('delete');
         };

         return { createdString, deleteItem };
      }
   });

</script>
