import winston, { format } from 'winston';
import { SPLAT } from 'triple-beam';
import { isDevelopment } from '@/config';

const interpolateFormat = format((info) => {
   const meta = (info as any)[SPLAT];
   if (!meta) { return info; }

   const metaObject = meta[0];

   const replacements: Map<string, string> = new Map();

   const message = info.message;
   const markers = message.matchAll(/{(.+?)}/g);
   for (const m of markers) {
      const name = m[1];
      let value = metaObject[name]?.toString();

      if (typeof value === 'number' || typeof value === 'bigint') {
         value = value.toLocaleString();
      }

      replacements.set(m[0], value);
   }

   let newMessage = message;
   for (const kvp of replacements) {
      newMessage = newMessage.replace(kvp[0], kvp[1]);
   }
   info.message = newMessage;
   return info;
});

export function createLogger(namespace: string): ILogger {

   const formats: winston.Logform.Format[] = [];

   if (isDevelopment) {
      formats.push(format.colorize());
   }

   formats.push(
      format(info => {
         return {
            level: info.level,
            message: `${namespace}: ${info.message}`
         };
      })()
   );

   formats.push(format.simple());

   return winston.createLogger({
      defaultMeta: { namespace: namespace },
      transports: [
         new winston.transports.Console({
            level: 'debug',
            format: format.combine(...formats)
         })
      ],
      format: format.combine(
         interpolateFormat()
      )
   });

}

export interface ILogger {
   silly(message: string, meta?: Record<string, any>): ILogger;
   debug(message: string, meta?: Record<string, any>): ILogger;
   info(message: string, meta?: Record<string, any>): ILogger;
   warn(message: string, meta?: Record<string, any>): ILogger;
   error(message: string, meta?: Record<string, any>): ILogger;

}