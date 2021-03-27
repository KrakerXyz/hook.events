
<template>
   <div>
      <h3>Config</h3>

      <div class="row mt-3">
         <div class="col">
            <div class="form-floating">
               <input
                  class="form-control"
                  v-model="dirtyHook.name"
                  placeholder="*"
                  id="hook-name"
               >
               <label for="hook-name">Name</label>
            </div>
         </div>
      </div>

      <div class="row mt-3">
         <div class="col">
            <div class="form-floating">
               <textarea
                  class="form-control"
                  v-model="dirtyHook.description"
                  placeholder="*"
                  id="hook-description"
               ></textarea>
               <label for="hook-description">Description</label>
            </div>
         </div>
      </div>

      <div class="row mt-3">
         <div class="col-md-6">
            <div class="form-check">
               <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="deleteCheck"
                  id="hook-delete-check"
               >
               <label
                  class="form-check-label text-danger"
                  for="hook-delete-check"
               >
                  Delete hook
               </label>
            </div>
         </div>
         <div
            class="col-md-6"
            v-if="deleteCheck"
         >
            <div class="form-text text-danger">
               Delete the hook and all it's events. This is cannot be undone.
            </div>
            <button class="btn btn-danger">DELETE</button>
         </div>
      </div>

      <div class="row mt-4">
         <div class="col-6">
            <button class="btn btn-secondary w-100">Cancel</button>
         </div>
         <div
            class="col-6"
            v-if="isDirty"
         >
            <button class="btn btn-primary w-100">Save</button>
         </div>
      </div>

   </div>
</template>

<script lang="ts">

   import { Hook } from 'hook-events';
   import { computed, defineComponent, reactive, ref } from 'vue';
   import { deepClone } from '@/services/deepClone';
   import { deepEquals } from '@/services/deepEquals';

   export default defineComponent({
      props: {
         hook: { type: Object as () => Hook, required: true }
      },
      emits: {
         update: (hook: Hook) => !!hook
      },
      setup(props) {

         const dirtyHook = reactive(deepClone(props.hook));

         const isDirty = computed(() => !deepEquals(dirtyHook, props.hook));

         const deleteCheck = ref(false);

         return { dirtyHook, isDirty, deleteCheck };
      }
   });

</script>


<style lang="postcss" scoped>
   textarea {
      min-height: 6rem;
   }
</style>