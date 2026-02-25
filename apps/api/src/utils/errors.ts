export class AppError extends Error {
    public code: string;
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, code: string, statusCode: number, isOperational = true) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
