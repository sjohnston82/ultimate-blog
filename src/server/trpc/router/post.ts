import slugify from "slugify";
import { z } from "zod";
import { writeFormSchema } from "../../../components/WriteFormModal";
import { commentFormSchema } from "../../../components/CommentSidebar";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const LIMIT = 10;

export const postRouter = router({
  createPost: protectedProcedure
    .input(
      writeFormSchema.and(
        z.object({
          tagIds: z.array(z.object({ id: z.string() })).optional(),
        })
      )
    )
    .mutation(
      async ({
        ctx: { prisma, session },
        input: { text, title, description, tagIds, html },
      }) => {
        const titleExists = await prisma.post.findFirst({
          where: { title },
        });

        if (titleExists) {
          throw new Error("Title already exists");
        } else {
          await prisma.post.create({
            data: {
              title,
              description,
              text,
              html,
              slug: slugify(title),
              authorId: session.user.id,
              tags: {
                connect: tagIds,
              },
            },
          });
        }
      }
    ),
  getPosts: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { cursor } }) => {
      const posts = await prisma.post.findMany({
        orderBy: { createdDate: "desc" },
        // include: {

        select: {
          title: true,
          id: true,
          description: true,
          slug: true,
          createdDate: true,
          author: {
            select: {
              name: true,
              image: true,
              username: true,
            },
          },
          bookmarks: session?.user?.id
            ? {
                where: {
                  userId: session?.user?.id,
                },
              }
            : false,
          tags: {
            select: {
              name: true,
              id: true,
              slug: true,
            },
          },
          featuredImage: true,
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: LIMIT + 1,
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (posts.length > LIMIT) {
        const nextItem = posts.pop();
        if (nextItem) nextCursor = nextItem.id;
      }

      return { posts, nextCursor };
    }),

  getPost: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { slug } }) => {
      const post = await prisma.post.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
          description: true,
          title: true,
          text: true,
          html: true,
          likes: session?.user?.id
            ? {
                where: {
                  userId: session?.user?.id,
                },
              }
            : false,
          authorId: true,
          featuredImage: true,
          slug: true,
        },
      });

      return post;
    }),

  likePost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { postId } }) => {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: postId,
        },
      });
    }),

  dislikePost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { postId } }) => {
      await prisma.like.delete({
        where: {
          userId_postId: {
            postId: postId,
            userId: session.user.id,
          },
        },
      });
    }),

  bookmarkPost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { postId } }) => {
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          postId: postId,
        },
      });
    }),

  unbookmarkPost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { postId } }) => {
      await prisma.bookmark.delete({
        where: {
          userId_postId: {
            postId: postId,
            userId: session.user.id,
          },
        },
      });
    }),

  getReadingList: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      const bookmarks = await prisma.bookmark.findMany({
        where: {
          userId: session.user.id,
        },
        take: 4,
        orderBy: {
          createdDate: "desc",
        },
        select: {
          post: {
            select: {
              author: true,
              title: true,
              description: true,
              createdDate: true,
              featuredImage: true,
              id: true,
              slug: true,
            },
          },
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      return bookmarks;
    }
  ),

  createComment: protectedProcedure
    .input(
      z.object({
        text: z.string().min(3),
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { text, postId } }) => {
      await prisma.comment.create({
        data: {
          text,
          author: {
            connect: {
              id: session.user.id,
            },
          },
          post: {
            connect: {
              id: postId,
            },
          },
        },
      });
    }),

  getComments: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx: { prisma }, input }) => {
      const comments = await prisma.comment.findMany({
        where: {
          postId: input.postId,
        },
        select: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          text: true,
          id: true,
          createdDate: true,
        },
        orderBy: {
          createdDate: "desc",
        },
      });

      return comments;
    }),

  updateFeaturedImage: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        imageUrl: z.string().url(),
      })
    )
    .mutation(
      async ({ ctx: { prisma, session }, input: { imageUrl, postId } }) => {
        const postData = await prisma.post.findUnique({
          where: {
            id: postId,
          },
        });

        if (postData?.authorId !== session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "You must be the author of this post to upload a featured image.",
          });
        }
        await prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            featuredImage: imageUrl,
          },
        });
      }
    ),
});
