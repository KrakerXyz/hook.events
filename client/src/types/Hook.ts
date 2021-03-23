
/** Information about a hook - a webhook receiver */
export interface Hook {

   /** A globally unique id for this hook */
   id: string;

   /** A description for the hook */
   description: string;

   /** The time the hook was created. Represented as number of milliseconds elapsed since Januar 1st, 1970, 00:00:00 UTC */
   created: number;

   /** For non-public hooks, the id of the user that created the hook */
   ownerId?: string | null;

}