import 'module-alias/register';

import express from 'express';
import compression from 'compression';
import http from 'http';
import cors from 'cors';
import { EnvKey, getOptionalConfig, getRequiredConfig } from './config';
import { ioEmit, ioSetup } from './services/socketIoService';
import { createLogger } from './services/logger';
import { EventData } from 'hook-events';
import { addEvent } from './services/persistence/eventDataStore';
import { v4 } from 'uuid';
import rootRouter from './api/rootRouter';
import { getHook } from './services/persistence/hookStore';
import { performance } from 'perf_hooks';
import path from 'path';
import { configureDb } from '@krakerxyz/typed-base';

const logger = createLogger('index');
logger.info('Application starting up. ENV = {env}, NODE_ENV = {nodeEnv}', { env: getRequiredConfig(EnvKey.ENV), nodeEnv: process.env['NODE_ENV'] });

const baseHost = getOptionalConfig(EnvKey.HOSTNAME, 'hook.events');

logger.info('Creating express app');
const app = express();

app.use(compression());

//https://docs.microsoft.com/en-us/azure/app-service/configure-language-nodejs?pivots=platform-linux#detect-https-session
app.set('trust proxy', 1);

const port = parseInt(getRequiredConfig(EnvKey.PORT), 10); // default port to listen

const BODY_LIMIT = 10000000;

app.use(cors());
app.use(rootRouter);

const staticHandler = express.static(__dirname + '/vueDist', {
   immutable: true,
   maxAge: '30d',
   index: false //Do not send index.html for /. We'll test for this and send it if needed within the 'all' handler 
});

app.all('/*', async (req, res) => {

   const startTime = performance.now();

   const created = Date.now();

   const host = req.hostname.toLowerCase();

   if (host === 'hook-events-app.azurewebsites.net' || host === '127.0.0.1') {
      //Probably a warmup request
      res.send();
      return;
   }

   if (req.method === 'GET' && host === baseHost) {

      logger.info('Received GET request for {url}. Returning SPA file', { url: `${host}${req.url}` });

      staticHandler(req, res, () => {

         //Two years is suggested
         res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

         // eslint-disable-next-line quotes
         res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kit.fontawesome.com https://kit-pro.fontawesome.com https://www.clarity.ms https://apis.google.com https://cdnjs.cloudflare.com; object-src 'none'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com  https://cdnjs.cloudflare.com; img-src 'self' https://*.googleusercontent.com data:; media-src 'none'; frame-src https://accounts.google.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://kit-pro.fontawesome.com https://ka-p.fontawesome.com https://www.clarity.ms");

         res.sendFile(path.resolve(__dirname, 'vueDist/index.html'));

      });

      return;

   } else if (!host.endsWith(baseHost)) {
      logger.warn('Unknown handler for {host}', { host });
      res.status(404).send(`Unknown handler for ${host}`);
      return;
   }

   const hookId = host.replace(`.${baseHost}`, '');
   if (!hookId || hookId == baseHost) {
      res.status(404).send('Hook not found');
      return;
   }

   logger.info('Receiving hook {hookId} event for {method} {path}', { hookId, method: req.method, path: req.path });

   logger.info('Starting load of hook from db');
   const hookLoadProm = getHook(hookId);

   let bodyError: EventData['bodyError'];
   let bodyProm: Promise<string | null | undefined> = Promise.resolve(undefined);

   const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);
   if (contentLength > BODY_LIMIT) {
      logger.info('Creating body error because content-length was over limit');
      bodyError = {
         errorCode: 'body-to-large',
         contentLength,
         maxLength: BODY_LIMIT
      };
   } else {

      bodyProm = new Promise(r => {

         if (!contentLength) {
            r(undefined);
            return;
         }

         if (typeof req.body === 'string') {
            const b64 = btoa(req.body);
            r(b64);
         }

         logger.info('Starting body data read');
         req.setEncoding('base64');
         let body = '';

         req.on('data', (d: string) => {
            body += d;
            if (body.length + 2 > BODY_LIMIT) {
               //Throwing an error because we should not have gotten here - the content length should have caught it
               throw new Error('BODY_LIMIT exceeded');
            }
         });

         req.on('end', () => {
            logger.info('Body read complete - {length} bytes read', { length: body.length });
            r(body);
         });

      });
   }


   //Deleting what I believe to be Azure NodeJS proxy related headers
   const headers: Record<string, string[]> = { ...req.headers } as Record<string, string[]>;
   delete headers['x-client-ip'];
   delete headers['x-client-port'];
   delete headers['max-forwards'];
   delete headers['x-waws-unencoded-url'];
   delete headers['client-ip'];
   delete headers['x-arr-log-id'];
   delete headers['disguised-host'];
   delete headers['x-site-deployment-id'];
   delete headers['was-default-hostname'];
   delete headers['x-original-url'];
   delete headers['x-forwarded-for'];
   delete headers['x-arr-ssl'];
   delete headers['x-forwarded-proto'];
   delete headers['x-appservice-proto'];
   delete headers['x-forwarded-tlsversion'];

   const evt: EventData = {
      id: v4(),
      created,
      hookId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      query: req.query as Record<string, string | string[]>,
      headers,
      body: bodyError ? undefined : await bodyProm,
      bodyError
   };

   logger.info('Awaiting db hook load');
   if (!await hookLoadProm) {
      logger.warn('Dropping event for hook {hookId} because it did not exist', { hookId });
      res.status(404).send('Hook does not exist');
      return;
   }

   logger.info('Persisting event');
   addEvent(evt);

   logger.info('Passing event to socketIo');
   ioEmit(evt);

   logger.info('Completed event receiver in {elapsed}ms', { elapsed: performance.now() - startTime });

   res.status(200).send();
});

logger.info('Creating https server');
const server = http.createServer(app);

ioSetup(server);

logger.info('Starting server listener');

server.listen(port, () => {
   logger.info(`server started on http://localhost:${port}`);
});

configureDb({
   dbName: 'hook-events',
   uri: getRequiredConfig(EnvKey.COSMOSDB_CONNECTION_STRING)
});