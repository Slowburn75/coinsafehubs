export class AppError extends Error {
    public code: string;
    public statusCode: number;
    public isPublic: boolean;
    public details?: any;

    constructor(message: string, code: string, statusCode: number, isPublic = true, details?: any) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isPublic = isPublic;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class AuthError extends AppError {
    constructor(message: string, code = 'AUTH_UNAUTHORIZED', statusCode = 401) {
        super(message, code, statusCode, true);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', 400, true, details);
    }
}

export class RateLimitError extends AppError {
    public retryAfter?: number;

    constructor(message: string, retryAfter?: number) {
        super(message, 'RATE_LIMIT_EXCEEDED', 429, true);
        this.retryAfter = retryAfter;
    }
}

export class DatabaseError extends AppError {
    constructor(message = 'A database error occurred', isPublic = false) {
        super(message, 'DATABASE_ERROR', 500, isPublic);
    }
}
