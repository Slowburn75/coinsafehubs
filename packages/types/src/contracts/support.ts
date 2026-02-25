import { oc } from '@orpc/contract';
import { z } from 'zod';
import { SupportTicketSchema, TicketStatusSchema } from '../schemas';

export const supportContract = oc.router({
    createTicket: oc.input(z.object({ subject: z.string(), message: z.string() })).output(z.object({ success: z.boolean() })),
    listTickets: oc.output(z.object({ tickets: z.array(SupportTicketSchema) })),
    updateTicket: oc.input(z.object({ ticketId: z.string(), status: TicketStatusSchema })).output(z.object({ success: z.boolean() }))
});
