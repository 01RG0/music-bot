import { Request, Response, NextFunction } from 'express';
export interface APIError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare function errorHandler(error: APIError, req: Request, res: Response, next: NextFunction): void;
export declare function createError(message: string, statusCode?: number): APIError;
//# sourceMappingURL=errorHandler.d.ts.map