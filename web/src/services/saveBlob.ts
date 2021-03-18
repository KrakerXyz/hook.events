
export function saveBlob(blob: Blob, fileName?: string) {

   const dataUrl = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.style.display = 'none';
   if (fileName) { a.download = fileName; }
   a.href = dataUrl;
   //a.download = fileName;
   document.body.appendChild(a);
   a.click();
   URL.revokeObjectURL(dataUrl);
   a.remove();

}