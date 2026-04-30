import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getProfileBio, upsertProfileBio, addBadge, updateBadge, deleteBadge } from "./queries/profile-bio";

export const profileRouter = createRouter({
  get: publicQuery.query(async () => {
    const bio = await getProfileBio();
    if (bio?.badges && typeof bio.badges === "string") {
      try { (bio as any).badgesParsed = JSON.parse(bio.badges as string); } catch {}
    }
    return bio;
  }),

  update: authedQuery
    .input(
      z.object({
        zhText: z.string().optional(),
        enText: z.string().optional(),
        email: z.string().max(320).optional(),
        instagram: z.string().max(500).optional(),
        badges: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => upsertProfileBio(input)),

  badgeAdd: authedQuery
    .input(
      z.object({
        name: z.string().max(100),
        description: z.string().max(500),
        icon: z.string().max(500),
        x: z.number().default(0),
        y: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => addBadge(input)),

  badgeUpdate: authedQuery
    .input(
      z.object({
        index: z.number(),
        name: z.string().max(100).optional(),
        description: z.string().max(500).optional(),
        icon: z.string().max(500).optional(),
        x: z.number().optional(),
        y: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { index, ...data } = input;
      return updateBadge(index, data);
    }),

  badgeDelete: authedQuery
    .input(z.object({ index: z.number() }))
    .mutation(async ({ input }) => deleteBadge(input.index)),
});
