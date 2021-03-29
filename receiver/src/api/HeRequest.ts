import { User } from '@/services/persistence/userStore';
import { Request } from 'express';

export interface HeRequest extends Request {
   user?: User;
   clientId?: string;
}