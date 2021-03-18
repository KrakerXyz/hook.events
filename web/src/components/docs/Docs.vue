
<template>
   <div class="container">
      <p v-html="html"></p>
   </div>
</template>

<script lang="ts">

   import { defineComponent } from 'vue';

   import gettingStartedNodeJs from './getting-started-nodejs.md';
   import expressProxy from './express-proxy.md';

   //https://marked.js.org/using_advanced see about using highlightjs or alternative for marked (which is used by markdown-loader)

   export default defineComponent({
      props: {
         view: { type: String }
      },
      setup(props) {
         let html: string = gettingStartedNodeJs;
         switch (props.view) {
            case 'express-proxy': {
               html = expressProxy;
            }
         }
         return { html };
      }
   });

</script>

<style>
   /*
         Monokai style - ported by Luigi Maselli - http://grigio.org
         */

   .hljs {
      display: block;
      overflow-x: auto;
      padding: 0.5em;
      background: #272822;
      color: #ddd;
   }

   .hljs-tag,
   .hljs-keyword,
   .hljs-selector-tag,
   .hljs-literal,
   .hljs-strong,
   .hljs-name {
      color: #f92672;
   }

   .hljs-code {
      color: #66d9ef;
   }

   .hljs-class .hljs-title {
      color: white;
   }

   .hljs-attribute,
   .hljs-symbol,
   .hljs-regexp,
   .hljs-link {
      color: #bf79db;
   }

   .hljs-string,
   .hljs-bullet,
   .hljs-subst,
   .hljs-title,
   .hljs-section,
   .hljs-emphasis,
   .hljs-type,
   .hljs-built_in,
   .hljs-builtin-name,
   .hljs-selector-attr,
   .hljs-selector-pseudo,
   .hljs-addition,
   .hljs-variable,
   .hljs-template-tag,
   .hljs-template-variable {
      color: #a6e22e;
   }

   .hljs-comment,
   .hljs-quote,
   .hljs-deletion,
   .hljs-meta {
      color: #75715e;
   }

   .hljs-keyword,
   .hljs-selector-tag,
   .hljs-literal,
   .hljs-doctag,
   .hljs-title,
   .hljs-section,
   .hljs-type,
   .hljs-selector-id {
      font-weight: bold;
   }
</style>
