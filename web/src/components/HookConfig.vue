
<template>
   <div>
      <h3>Config</h3>

      <div class="
      row
      mt-3">
         <div class="col">
            <div class="form-floating">
               <input
                  class="form-control"
                  v-model="dirtyHook.name"
                  :disabled="formDisabled"
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
                  :disabled="formDisabled"
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
                  :disabled="formDisabled"
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
            <button
               class="btn btn-danger"
               @click="deleteHook()"
               :disabled="formDisabled"
            >DELETE</button>
         </div>
      </div>

      <div class="row mt-4">
         <div class="col-6">
            <button
               class="btn btn-secondary w-100"
               :disabled="formDisabled"
               @click="$emit('close')"
            >Cancel</button>
         </div>
         <div
            class="col-6"
            v-if="isDirty"
         >
            <button
               class="btn btn-primary w-100"
               :disabled="formDisabled"
               @click="save()"
            >Save</button>
         </div>
      </div>

   </div>
</template>

<script lang="ts">

   import { Hook, HookUpdate } from 'hook-events';
   import { computed, defineComponent, reactive, ref } from 'vue';
   import { deepClone } from '@/services/deepClone';
   import { deepEquals } from '@/services/deepEquals';
   import { useApiClient } from '@/services/useApiClient';

   export default defineComponent({
      props: {
         hook: { type: Object as () => Hook, required: true }
      },
      emits: {
         update: (hook: Hook) => !!hook,
         delete: () => true,
         close: () => true
      },
      setup(props, { emit }) {

         const dirtyHook = reactive(deepClone(props.hook));

         const isDirty = computed(() => !deepEquals(dirtyHook, props.hook));

         const deleteCheck = ref(false);

         const formDisabled = ref(false);

         const saveError = ref<string | null>(null);

         const apiClient = useApiClient();

         const save = async () => {
            try {
               saveError.value = null;
               formDisabled.value = true;
               const hookUpdate: HookUpdate = {
                  name: dirtyHook.name,
                  description: dirtyHook.description
               };
               const savedHook = await apiClient.updateHook(dirtyHook.id, hookUpdate);
               emit('update', savedHook);
               emit('close');
            } catch (e) {
               console.error(e);
               saveError.value = 'There was an error saving the hook';
            } finally {
               formDisabled.value = false;
            }
         };

         const deleteHook = async () => {
            try {
               saveError.value = null;
               formDisabled.value = true;
               await apiClient.deleteHook(dirtyHook.id);
               emit('delete');
               emit('close');
            } catch (e) {
               console.error(e);
               saveError.value = 'There was an error saving the hook';
            } finally {
               formDisabled.value = false;
            }
         };

         return { dirtyHook, isDirty, deleteCheck, formDisabled, save, deleteHook };
      }
   });

</script>


<style lang="postcss" scoped>
   textarea {
      min-height: 6rem;
   }
</style>