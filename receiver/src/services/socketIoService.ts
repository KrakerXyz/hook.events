import type { EventData } from 'hook-events';
import { Server } from 'http';

import io from 'socket.io';
import { createLogger } from './logger';
import { getHook } from './persistence/hookStore';
import { verifyAuthorizationHeader } from './verifyAuthorization';

let ioServer: io.Server | null = null;

const logger = createLogger('socketIoService');

export function ioSetup(server: Server): void {

   logger.info('Creating Socket.Io server');

   if (ioServer) { throw new Error('ioSetup has already been called'); }

   ioServer = new io.Server(server, {
      path: '/b1cb9b4abce54cd8add7e0ad9be94e4b'
   });

   ioServer.on('connection', clientConnected);

   ioServer.use(async (socket, next) => {

      const fn = (error: string | null, success: boolean) => {

         if (!success) {
            logger.warn('Failed socket handshake - {errorMessage}', { errorMessage: error });
            next(new Error(error ?? ''));
            return;
         }

         next();
      };

      const hookId = socket.handshake.query['hookId'] as string | undefined;

      if (!hookId) {
         fn('hookId query required', false);
         return;
      }

      const hook = await getHook(hookId);

      if (!hook) {
         fn('hook does not exist', false);
         return;
      }

      if (hook.ownerId) {

         const authHeader = socket.handshake.auth['token'];

         try {
            await verifyAuthorizationHeader(authHeader);
         } catch (e) {
            fn(e, false);
            return;
         }

      }

      fn(null, true);
   });
}

function clientConnected(socket: io.Socket): void {
   const socketId = socket.id;
   const hookId = socket.handshake.query['hookId'] as string;
   if (!hookId) { throw new Error('Request did not have a hookId'); }
   logger.info('Socket {socketId} connected for hook {hookId}', { socketId, hookId });
   socket.join(hookId);

   socket.on('disconnect', () => logger.info('Socket {socketId} disconnected', { socketId }));
}

export function ioEmit(eventData: EventData): void {
   if (!ioServer) { throw new Error('ioSetup has not been called'); }
   logger.debug('Emitting eventData {eventId} to {hookId}', { eventId: eventData.id, hookId: eventData.hookId });
   ioServer.to(eventData.hookId).emit('event', eventData);
}