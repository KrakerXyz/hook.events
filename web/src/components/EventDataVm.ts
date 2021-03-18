import { EventData, EventDataSlim } from 'hook-events/types';

export interface EventDataVm {
   event: EventData | EventDataSlim;
   body: any;
}