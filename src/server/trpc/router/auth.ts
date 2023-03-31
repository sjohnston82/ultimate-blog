import { router, publicProcedure, protectedProcedure } from "../trpc";
import {z} from 'zod'

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  
});
