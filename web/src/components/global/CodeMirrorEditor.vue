
<template>
   <div class="h-100" ref="el"></div>
</template>

<script lang="ts">

   import { defineComponent, onMounted, ref, toRef, computed } from 'vue';
   import { CodeMirrorLanguage, useCodeMirrorAsync } from '@/services/useCodeMirror';

   export default defineComponent({
      props: {
         modelValue: { type: String, required: true },
         readonly: { type: Boolean, default: false },
         language: { type: String as () => CodeMirrorLanguage, default: CodeMirrorLanguage.Javascript }
      },
      emits: {
         'update:modelValue': (input: string): boolean => !!input
      },
      setup(props, ctx) {

         const el = ref<HTMLElement | null>(null);

         const code = computed({
            get() {
               return props.modelValue;
            },
            set(value: string) {
               if (props.readonly) { return; }
               ctx.emit('update:modelValue', value);
            }
         });

         onMounted(() => {
            console.assert(!!el.value);
            useCodeMirrorAsync(el.value!, toRef(props, 'readonly'), code, props.language);
         });

         return { el };
      }
   });

</script>
