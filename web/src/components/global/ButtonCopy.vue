
<template>
   <button
      class="btn btn-link"
      title="Click to copy to clipboard"
      @click="copy()"
   >
      <i class="fad fa-copy"></i>
   </button>
</template>

<script lang="ts">

   import { defineComponent } from 'vue';

   export default defineComponent({
      props: {
         text: { type: String, required: true }
      },
      setup(props) {

         const copy = () => {
            const el = document.createElement('textarea');
            el.value = props.text;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
         };

         return { copy };
      }
   });

</script>
