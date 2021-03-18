import type { EventData } from 'hook-events';
import { Server } from 'http';

import io from 'socket.io';
import { createLogger } from './logger';
import { getHook } from './persistence/hookStore';

let ioServer: io.Server | null = null;

const logger = createLogger('socketIoService');

export function ioSetup(server: Server): void {

   logger.info('Creating Socket.Io server');

   if (ioServer) { throw new Error('ioSetup has already been called'); }

   ioServer = new io.Server(server, {
      path: '/b1cb9b4abce54cd8add7e0ad9be94e4b',
      allowRequest(req, fn) {
         if (req.url?.includes('hookId=')) {
            fn(null, true);
         } else {
            fn('hookId query required', false);
         }
      }
   });

   ioServer.on('connection', clientConnected);

}

function clientConnected(socket: io.Socket): void {
   const socketId = socket.id;
   const hookId = (socket.handshake.query as any).hookId as string;
   if (!hookId) { throw new Error('Request did not have a hookId'); }
   logger.info('Socket {socketId} connected for hook {hookId}', { socketId, hookId });
   socket.join(hookId);

   logger.debug('Verifying that hook {hookId} exists', { hookId });
   getHook(hookId).then(h => {
      if (h) { return; }
      logger.warn('Disconnecting socket {socketId} because the hook {hookId} did not exist', { socketId, hookId });
      socket.emit('not-found', 'Given hook did not exist, disconnecting');
      socket.disconnect();
   });

   socket.on('disconnect', () => logger.info('Socket {socketId} disconnected', { socketId }));
}

export function ioEmit(eventData: EventData): void {
   if (!ioServer) { throw new Error('ioSetup has not been called'); }
   logger.debug('Emitting eventData {eventId} to {hookId}', { eventId: eventData.id, hookId: eventData.hookId });
   ioServer.to(eventData.hookId).emit('event', eventData);
}