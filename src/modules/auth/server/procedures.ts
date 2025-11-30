import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { headers as getHeaders, cookies as getCookies } from 'next/headers';
import { z } from 'zod';
import { AUTH_TOKEN_NAME } from '../constants';
import { registerSchema } from '../schemas';
import { generateAuthCookie } from '../utils';

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    const session = await ctx.payload.auth({ headers });
    return session;
  }),
  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const existingData = await ctx.payload.find({
        collection: 'users',
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });
      const existingUser = existingData.docs[0];

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        });
      }
      await ctx.payload.create({
        collection: 'users',
        data: {
          username: input.username,
          password: input.password,
          email: input.email,
        },
      });

      const loginUser = await ctx.payload.login({
        collection: 'users',
        data: {
          password: input.password,
          email: input.email,
        },
      });
      if (!loginUser.token) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Failed to login',
        });
      }
      await generateAuthCookie({
        prefix: ctx.payload.config.cookiePrefix,
        value: loginUser.token,
      });
    }),
  login: baseProcedure
    .input(
      z.object({
        password: z.string(),
        email: z.email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.payload.login({
        collection: 'users',
        data: {
          password: input.password,
          email: input.email,
        },
      });
      if (!user.token) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Failed to login',
        });
      }
      await generateAuthCookie({
        prefix: ctx.payload.config.cookiePrefix,
        value: user.token,
      });
      return user;
    }),
  logout: baseProcedure.mutation(async () => {
    const cookies = await getCookies();
    cookies.delete(AUTH_TOKEN_NAME);
  }),
});
