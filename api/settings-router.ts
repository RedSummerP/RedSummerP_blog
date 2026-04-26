import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getSiteSettings, upsertSiteSettings } from "./queries/site-settings";

export const settingsRouter = createRouter({
  get: publicQuery.query(async () => getSiteSettings()),

  update: authedQuery
    .input(
      z.object({
        avatarImage: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => upsertSiteSettings(input)),
});
