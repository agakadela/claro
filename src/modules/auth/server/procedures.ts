import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { headers as getHeaders, cookies as getCookies } from 'next/headers';
import { z } from 'zod';
import { AUTH_TOKEN_MAX_AGE, AUTH_TOKEN_NAME } from '../constants';
import { registerSchema } from '../schemas';

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
      const cookies = await getCookies();
      cookies.set({
        name: AUTH_TOKEN_NAME,
        value: loginUser.token,
        httpOnly: true,
        maxAge: AUTH_TOKEN_MAX_AGE,
        sameSite: 'none',
        // domain: process.env.NODE_ENV === 'production' ? 'claro.com' : 'localhost',
        path: '/',
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
      const cookies = await getCookies();
      cookies.set({
        name: AUTH_TOKEN_NAME,
        value: user.token,
        httpOnly: true,
        maxAge: AUTH_TOKEN_MAX_AGE,
        // sameSite: 'none',
        // domain: process.env.NODE_ENV === 'production' ? 'claro.com' : 'localhost',
        path: '/',
      });
      return user;
    }),
  logout: baseProcedure.mutation(async () => {
    const cookies = await getCookies();
    cookies.delete(AUTH_TOKEN_NAME);
  }),
});
