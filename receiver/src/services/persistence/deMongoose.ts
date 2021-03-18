
import type { Document } from 'mongoose';

export function deMongoose<T>(doc: Document | null): T | null;
export function deMongoose<T>(docs: Document[]): T[];
export function deMongoose<T>(doc: Document | Document[] | null): (T | null) | T[] {

   if (Array.isArray(doc)) {
      return doc.map(d => deMongoose<T>(d)) as T[];
   }

   if (!doc) { return null; }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const { _id, ...other } = doc.toObject({ versionKey: false }) as any;

   return other as T;
}