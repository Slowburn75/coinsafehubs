import { z } from 'zod'
import { ValidationError } from './errors'

export const formatZodError = (error: z.ZodError) => {
    const fields: Record<string, string> = {}

    error.errors.forEach((err) => {
        const path = err.path.join('.')
        fields[path] = err.message
    })

    return new ValidationError('Validation failed', fields)
}
