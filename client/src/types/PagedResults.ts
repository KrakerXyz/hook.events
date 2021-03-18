
/** Includes results for a API request that returns paged results  */
export interface PagedResults<T> {

   /** The subset of results for this request */
   results: T[];

   /** Indicates whether more results are available  */
   hasMore: boolean;

   /** A token that can be submitted to the API to load the next page of results. Token will be empty if no additional results are available */
   continuationToken?: string | null;
}