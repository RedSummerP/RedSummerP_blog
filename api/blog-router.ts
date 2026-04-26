import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery, authedQuery } from "./middleware";
import {
  findAllPosts,
  findPublicPosts,
  findPostsByUserId,
  findPostById,
  createPost,
  updatePost,
  deletePost,
} from "./queries/posts";

export const blogRouter = createRouter({
  list: publicQuery.query(async () => findPublicPosts()),

  listAdmin: adminQuery.query(async () => findAllPosts()),

  listMine: authedQuery.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    return findPostsByUserId(ctx.user.id);
  }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await findPostById(input.id);
      return post;
    }),

  create: authedQuery
    .input(
      z.object({
        year: z.string().max(10),
        image: z.string().max(500),
        sortOrder: z.number().optional(),
        zhTitle: z.string().max(255),
        zhSubtitle: z.string().max(255),
        zhCollection: z.string().max(255),
        zhContent: z.string(),
        zhDetailContent: z.string(),
        isPublic: z.boolean().optional(),
        enTitle: z.string().max(255),
        enSubtitle: z.string().max(255),
        enCollection: z.string().max(255),
        enContent: z.string(),
        enDetailContent: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return createPost({ ...input, userId: ctx.user?.id ?? null });
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        year: z.string().max(10).optional(),
        image: z.string().max(500).optional(),
        sortOrder: z.number().optional(),
        zhTitle: z.string().max(255).optional(),
        zhSubtitle: z.string().max(255).optional(),
        zhCollection: z.string().max(255).optional(),
        zhContent: z.string().optional(),
        zhDetailContent: z.string().optional(),
        isPublic: z.boolean().optional(),
        enTitle: z.string().max(255).optional(),
        enSubtitle: z.string().max(255).optional(),
        enCollection: z.string().max(255).optional(),
        enContent: z.string().optional(),
        enDetailContent: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const existing = await findPostById(id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      if (existing.userId !== ctx.user?.id && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own posts" });
      }
      return updatePost(id, data);
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await findPostById(input.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      if (existing.userId !== ctx.user?.id && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own posts" });
      }
      await deletePost(input.id);
      return { success: true };
    }),
});
