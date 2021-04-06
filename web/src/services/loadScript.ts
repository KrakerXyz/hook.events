
const scripts: Record<string, Promise<void>> = {};

/** Adds a script to the body and returns a promise that resolves once loaded. Before adding, it first checks that a script with the same id has not already been added. Returns false if the script was previously added. */
export function loadScript(src: string, id: string): Promise<void> {
   let prom = scripts[id];
   if (prom) { return prom; }

   prom = new Promise<void>(resolve => {
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.onload = (): void => {
         resolve();
      };
      document.body.appendChild(script);
   });

   scripts[id] = prom;

   return prom;
}

/** Adds a stylesheet import to the head and returns a promise that resolves once loaded. Before adding, it first checks that a stylesheet with the same id has not already been added. Returns false if the stylesheet was previously added. */
export function loadCss(src: string, id: string): Promise<void> {
   if (document.getElementById(id)) { return Promise.resolve(); }
   return new Promise<void>(resolve => {
      const stylesheet = document.createElement('link');
      stylesheet.id = id;
      stylesheet.href = src;
      stylesheet.rel = 'stylesheet';
      stylesheet.type = 'text/css';
      stylesheet.onload = (): void => resolve();
      document.head.appendChild(stylesheet);
   });
}


let codeMirrorLoader: Promise<void> | null = null;
export function loadCodeMirrorAsync(): Promise<void> {
   if (codeMirrorLoader) { return codeMirrorLoader; }

   const version = '5.59.1';

   codeMirrorLoader = loadScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/codemirror.min.js`, 'script-code-mirror').then(() => {
      return Promise.all([
         loadScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/mode/javascript/javascript.min.js`, 'script-code-mirror-javascript'),
         loadScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/mode/xml/xml.min.js`, 'script-code-mirror-xml'),

         loadScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/addon/scroll/simplescrollbars.min.js`, 'script-code-mirror-scroll'),
         loadScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/addon/fold/foldcode.min.js`, 'script-code-mirror-fold-code'),
         loadScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/addon/fold/foldgutter.min.js`, 'script-code-mirror-fold-gutter'),
         loadScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/addon/fold/brace-fold.min.js`, 'script-code-mirror-brace-fold'),
         loadScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/addon/edit/closebrackets.min.js`, 'script-code-mirror-close-brackets'),

         loadCss(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/codemirror.min.css`, 'stylesheet-code-mirror'),
         loadCss(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/theme/material-palenight.min.css`, 'stylesheet-code-mirror-theme'),
         loadCss(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/addon/scroll/simplescrollbars.min.css`, 'stylesheet-code-mirror-scrollbars'),
         loadCss(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/${version}/addon/fold/foldgutter.min.css`, 'stylesheet-code-mirror-fold-gutter')
      ]);
   }) as Promise<any>;

   return codeMirrorLoader;
}
