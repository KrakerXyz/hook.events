import { User } from '@/services/persistence/userStore';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
   user?: User
}