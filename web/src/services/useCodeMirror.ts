import { Ref, onUnmounted, ref, isRef, watch } from 'vue';
import { loadCodeMirrorAsync } from './loadScript';

export enum CodeMirrorLanguage {
   Javascript = 'javascript',
   Json = 'json',
   Html = 'xml'
}

export async function useCodeMirrorAsync(target: string | HTMLElement, readonly: Ref<boolean> | boolean = false, value: Ref<string> | string, language: CodeMirrorLanguage = CodeMirrorLanguage.Javascript): Promise<CodeMirror.Editor> {

   console.assert(value !== undefined);

   let editor: CodeMirror.Editor | null = null;

   onUnmounted(() => {
      if (!editor) { return; }
      editor.getWrapperElement().remove();
   });

   await loadCodeMirrorAsync();

   target = (typeof target === 'string' ? document.getElementById(target)! : target);
   console.assert(!!target, 'codemirror target not found');

   const languageOptions: any = { mode: { name: language } };

   if (language === CodeMirrorLanguage.Json) {
      languageOptions.mode.name = CodeMirrorLanguage.Javascript;
      languageOptions.mode.json = true;
   }

   if (language === CodeMirrorLanguage.Html) {
      languageOptions.mode.htmlMode = true;
   }

   editor = (window as any).CodeMirror(target, {
      ...languageOptions,
      theme: 'material-palenight',
      lineNumbers: true,
      styleActiveLine: true,
      matchBrackets: true,
      lineWrapping: true,
      scrollbarStyle: 'simple',
      indentUnit: 3,
      tabSize: 3,
      autoCloseBrackets: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
   });

   const readonlyRef: Ref<boolean> = (isRef(readonly) ? readonly : ref(readonly));

   watch(() => readonlyRef.value, ro => {
      editor!.setOption('readOnly', ro);
   }, { immediate: true });

   editor!.setOption('extraKeys', {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      'Shift-Alt-F': function (cm: any) {
         //TODO: Add autoformat
         //Codemirror remove it's autoformat so the best option now is to use this https://github.com/beautify-web/js-beautify
         //we'll then do cm.setValue(js_beautify(cm.getValue()))
      }
   });

   if (typeof value === 'string') {
      editor!.setValue(value);
   } else {
      let lastValue = '';
      watch(() => value.value, newValue => {
         if ((newValue || '') === (lastValue || '')) {
            return;
         }
         editor!.setValue(newValue);
         lastValue = newValue;
      }, { immediate: true });

      editor!.on('change', () => {
         const newValue = editor!.getValue();
         if (newValue === lastValue) { return; }
         value.value = newValue;
         lastValue = newValue;
      });
   }

   return editor!;

}
