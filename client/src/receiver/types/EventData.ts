
/** Normalized representation of the request made to the webhook */
export interface EventData {

   /** A v4 guid that identifies this request */
   id: string;
   /** A timestamp of when the request first hit the receiver. Represented as the number of milliseconds since January 1, 1970 00:00:00 UTC  */
   created: number;
   /** The id of the webhook that captured the event */
   hookId: string;
   /** The HTTP Method that was used when calling the webhook */
   method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;
   /** The path that was supplied to the webhook. Eg /foo/bar/1?userId=6456345 */
   path: string;
   /** The IP address of the caller */
   ip: string;
   /** Any query parameters supplied. Eg { userId: '6456345} } */
   query: Record<string, undefined | string | string[]>;
   /** The headers of the request. Eg { authorized: 'bearer api_token', 'content-type': 'application/json' }  */
   headers: Record<string, string[]>;
   /** When present, a base64 encoded string of the entire request body. undefined if the request did not have a body. null if the body could not be parsed - see bodyError for reason */
   body?: string | null;
   /** If the body could not be parsed, details about the reason  */
   bodyError?: {
      /** A error code representing the reason for the error */
      errorCode: 'body-to-large',
      /** The actual contentLength of the request */
      contentLength: number,
      /** The maximum content length permitted for this hook */
      maxLength: number
   }
}

/** A copy of EventData without the full body */
export interface EventDataSlim extends Omit<EventData, 'body'> {

   /** Indicates whether or not a body exists for this event. When true, use the body api to retreive it */
   hasBody: boolean;

}