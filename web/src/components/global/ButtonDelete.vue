
<template>
   <button
      type="button"
      class="btn btn-link text-danger"
   >
      <i class="fal fa-trash-alt"></i>
      <span
         v-if="!!this.$slots.default"
         class="ms-3"
      >
         <slot></slot>
      </span>
   </button>
</template>

<script lang="ts">
   export default {};
</script>
