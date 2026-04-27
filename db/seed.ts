import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { posts, profileBio, cvEntries, localUsers, siteSettings } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // 1. Seed admin user
  const existingUsers = await getDb().select().from(localUsers);
  if (existingUsers.length === 0) {
    const passwordHash = await bcrypt.hash("123456#Wxb", 12);
    await getDb().insert(localUsers).values({
      username: "admin",
      passwordHash,
      name: "Admin",
      role: "admin",
    });
    console.log("  Created admin user");
  } else {
    console.log("  Admin user already exists");
  }

  // 2. Skip seeding blog posts (user creates their own)
  console.log("  Skipping blog post seeding (user-managed)");

  // 3. Seed profile bio
  const existingBio = await getDb().select().from(profileBio);
  if (existingBio.length === 0) {
    await getDb().insert(profileBio).values({
      id: 1,
      zhText: "一个热爱创造的开发者 / 写作者 / 游戏制作人。现居杭州，白天写代码，晚上画像素、写故事。正在开发独立游戏《星隙旅人》，同时在Rust、游戏引擎和科幻小说的世界里不断探索。我相信代码和文字都是表达的工具，而创造本身就是存在的意义。",
      enText: "A creator who codes, writes, and makes games. Based in Hangzhou, I write code by day and draw pixels & stories by night. Currently developing the indie game Stellar Vagabond, while exploring the worlds of Rust, game engines, and sci-fi fiction. I believe code and words are both tools of expression, and creation itself is the meaning of existence.",
      email: "creator@stellarvagabond.dev",
      instagram: "https://github.com",
    });
    console.log("  Seeded profile bio");
  } else {
    console.log("  Profile bio already exists");
  }

  // 4. Seed CV entries
  const existingCv = await getDb().select().from(cvEntries);
  if (existingCv.length === 0) {
    const seedCv = [
      { category: "Skills", zhTitle: "编程语言", zhSubtitle: "Rust / TypeScript / C++ / Python", enTitle: "Programming", enSubtitle: "Rust / TypeScript / C++ / Python", year: "", sortOrder: 1 },
      { category: "Skills", zhTitle: "游戏开发", zhSubtitle: "自研引擎 / ECS架构 / 像素艺术 / 游戏设计", enTitle: "Game Development", enSubtitle: "Custom Engine / ECS Architecture / Pixel Art / Game Design", year: "", sortOrder: 2 },
      { category: "Skills", zhTitle: "创作写作", zhSubtitle: "科幻小说 / 角色设定 / 世界观构建", enTitle: "Creative Writing", enSubtitle: "Sci-Fi Fiction / Character Design / Worldbuilding", year: "", sortOrder: 3 },
      { category: "Projects", zhTitle: "星隙旅人", zhSubtitle: "独立2D平台冒险游戏 / Rust自研引擎", enTitle: "Stellar Vagabond", enSubtitle: "Indie 2D Platform Adventure / Rust Custom Engine", year: "2023 - 至今", sortOrder: 4 },
      { category: "Projects", zhTitle: "零号文档", zhSubtitle: "科幻短篇小说 / 关于记忆与数字永生", enTitle: "Document Zero", enSubtitle: "Sci-Fi Short Story / Memory & Digital Immortality", year: "2023", sortOrder: 5 },
      { category: "Projects", zhTitle: "像素角色系列", zhSubtitle: "原创角色(OC)设计与像素艺术", enTitle: "Pixel Character Series", enSubtitle: "Original Character (OC) Design & Pixel Art", year: "2023 - 2024", sortOrder: 6 },
    ];

    for (const entry of seedCv) {
      await getDb().insert(cvEntries).values(entry);
    }
    console.log(`  Seeded ${seedCv.length} CV entries`);
  } else {
    console.log(`  ${existingCv.length} CV entries already exist`);
  }

  // 5. Seed site settings
  const existingSettings = await getDb().select().from(siteSettings);
  if (existingSettings.length === 0) {
    await getDb().insert(siteSettings).values({
      id: 1,
      avatarImage: "/images/portrait.jpg",
    });
    console.log("  Seeded site settings");
  } else {
    console.log("  Site settings already exist");
  }

  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
