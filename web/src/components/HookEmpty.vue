
<template>
   <div class="container text-center">
      <h3 class="alert alert-primary font-monospace mt-5 mb-4 text-truncate">{{hookUrl}}</h3>
      <p class="mb-4">Hook ID <span class="font-monospace">{{hookId}}</span> has been created but no requests have been received.</p>
      <small>If you're excited to see what a incoming request looks like,
         <a
            :href="hookUrl"
            target="_blank"
         >
            open your hook in the broser <i class="fad fa-external-link"></i>
         </a>
         to perform a simple GET request
      </small>

      <div class="alert alert-danger mt-4 p-1">Hooks that have not received an event in the past 30 days days are subject to deletion</div>
   </div>
</template>

<script lang="ts">

   import { useHookAddress } from '@/services/useHookAddress';
   import { defineComponent } from 'vue';

   export default defineComponent({
      props: {
         hookId: { type: String, required: true }
      },
      setup(props) {

         const hookUrl = useHookAddress(props.hookId);

         return { hookUrl };
      }
   });

</script>
