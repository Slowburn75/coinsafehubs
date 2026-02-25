import { Context } from 'hono'

export const successResponse = (c: Context, data: any, status: number = 200) => {
    return c.json({
        success: true,
        data,
    }, status as any)
}

export const errorResponse = (c: Context, error: { code: string; message: string; status: number; details?: any; fields?: any }) => {
    return c.json({
        success: false,
        error: {
            code: error.code,
            message: error.message,
            status: error.status,
            details: error.details,
            fields: error.fields,
        }
    }, error.status as any)
}
