
/** The type of state change */
export enum ConnectionType {
   /** A new client has connected */
   Connected,
   /** A existing client has disconnected */
   Disconnected
}

/** Notification that occurs when there are changes to the connected listeners of a  hook */
export interface Connection {

   /** The client id that may have been given for the connection */
   clientId: string | null;

   /** The type of state change */
   type: ConnectionType;

}