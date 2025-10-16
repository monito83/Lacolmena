import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        familyId?: string;
        teacherId?: string;
      };
    }
  }
}

export {};


