import { oc } from '@orpc/contract';
import { z } from 'zod';
import { LoginSchema, RegisterSchema, UserSchema } from '../schemas';

export const authContract = oc.router({
    login: oc.input(LoginSchema).output(z.object({ user: UserSchema })),
    register: oc.input(RegisterSchema).output(z.object({ user: UserSchema })),
    me: oc.output(z.object({ user: UserSchema })),
    logout: oc.output(z.object({ success: z.boolean() }))
});
