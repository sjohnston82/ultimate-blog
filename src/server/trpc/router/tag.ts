import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const tagRouter = router({
  createTag: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string().min(3),
      })
    )
    .mutation(async ({ ctx: { prisma }, input }) => {
      const tag = await prisma.tag.findUnique({
        where: {
          name: input.name,
        },
      });

      if (tag) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag already exists!",
        });
      }

      await prisma.tag.create({
        data: {
          ...input,
          slug: slugify(input.name),
        },
      });
    }),

  getTags: protectedProcedure.query(async ({ ctx: { prisma } }) => {
    return await prisma.tag.findMany();
  }),

  // getPostsByTag: publicProcedure
  //   .input(
  //     z.object({
  //       slug: z.string(),
  //     })
  //   )
  //   .query(async ({ ctx: { prisma, session }, input: { slug } }) => {
  //     const posts = await prisma.post.findMany({
  //       where: {
  //         tags: { 
            
  //             slug
  //           }
  //       }
        // where: {
        //   slug,
        // },
        // select: {
        //   posts: {
        //     select: {
        //       title: true,
        //       id: true,
        //       description: true,
        //       slug: true,
        //       createdDate: true,
        //       author: {
        //         select: {
        //           name: true,
        //           image: true,
        //           username: true,
        //         },
        //       },
        //       bookmarks: session?.user?.id
        //         ? {
        //             where: {
        //               userId: session?.user?.id,
        //             },
        //           }
        //         : false,
        //       tags: {
        //         select: {
        //           name: true,
        //           id: true,
        //           slug: true,
        //         },
        //       },
        //     },
        //   },
        // },
      // });

      // return posts;
    // }),
});
