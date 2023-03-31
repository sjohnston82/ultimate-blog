import { router } from "../trpc";
import { authRouter } from "./auth";
import { postRouter } from "./post";
import { userRouter } from "./user";
import { tagRouter } from "./tag";
import { unsplashRouter } from "./unsplash";

export const appRouter = router({
  auth: authRouter,
  posts: postRouter,
  user: userRouter,
  tag: tagRouter,
  unsplash: unsplashRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
