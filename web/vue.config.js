// @ts-nocheck

module.exports = {
   configureWebpack: config => {
      // eslint-disable-next-line no-undef
      if (process.env.NODE_ENV === 'development') {
         config.devtool = 'eval-source-map';
         config.output.devtoolModuleFilenameTemplate = info =>

            info.resourcePath.match(/\.vue$/) && !info.identifier.match(/type=script/)  // this is change ✨ 
               ? `webpack-generated:///${info.resourcePath}?${info.hash}`
               : `webpack-yourCode:///${info.resourcePath}`;

         config.output.devtoolFallbackModuleFilenameTemplate = 'webpack:///[resource-path]?[hash]';
      } else {
         //Added this line to drop all console.____ from output in production
         config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
      }
   },
   chainWebpack: config => {

      config.module
         .rule('md')
         .test(/\.md$/)
         .use('html-loader')
         .loader('html-loader').end()
         .use('markdown-loader')
         .loader('markdown-loader')
         .tap(options => {

            if (!options) { options = {}; }

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const highlight = require('highlight.js');

            options.highlight = (code, lang) => {
               /* cSpell:disable */
               if (!lang || ['text', 'literal', 'nohighlight'].includes(lang)) {
                  return `<pre class="hljs rounded p-3">${code}</pre>`;
               }
               const html = highlight.highlight(code, { language: lang }).value;
               return `<span class="hljs rounded p-3">${html}</span>`;
               /* cSpell:enable */
            };

            return options;
         });
   },
   devServer: {
      proxy: {
         '^/api': {
            target: 'http://localhost:3000'
         }
      }
   }
};