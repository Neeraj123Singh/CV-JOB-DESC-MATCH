import { inferAsyncReturnType, initTRPC } from '@trpc/server';

export const createContext = () => ({});
export type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();
