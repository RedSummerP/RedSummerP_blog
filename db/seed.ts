import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { posts, profileBio, cvEntries, localUsers, siteSettings } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // 1. Seed admin user
  const existingUsers = await getDb().select().from(localUsers);
  if (existingUsers.length === 0) {
    const passwordHash = await bcrypt.hash("123456", 12);
    await getDb().insert(localUsers).values({
      username: "admin",
      passwordHash,
      name: "Admin",
      role: "admin",
    });
    console.log("  Created admin user (admin / 123456)");
  } else {
    console.log("  Admin user already exists");
  }

  // 2. Seed blog posts
  const existingPosts = await getDb().select().from(posts);
  if (existingPosts.length === 0) {
    const seedPosts = [
      {
        year: "2024",
        image: "/images/hero-art.jpg",
        sortOrder: 1,
        zhTitle: "用 Rust 重写游戏引擎的一年",
        zhSubtitle: "从性能瓶颈到内存安全的思考",
        zhCollection: "编程笔记",
        zhContent: "去年决定将自研的2D游戏引擎从C++迁移到Rust，初衷很简单：受够了段错误和内存泄漏。但真正动笔后才发现，Rust的学习曲线远比想象中陡峭——它强迫你重新思考所有权、生命周期和借用检查。",
        zhDetailContent: `迁移开始于去年三月。当时的引擎已经用C++写了近两年，功能相对完整：支持精灵图渲染、物理碰撞、音频播放和简单的粒子系统。但每次新增功能，内存问题就像幽灵一样出现。

Rust的所有权模型是最大的挑战。在C++里，你可以随意传递指针，出了问题再调试。Rust不给你这个机会——编译器会在你犯错之前就拒绝编译。最初的两周，我每天都在和borrow checker搏斗，一度怀疑这个决定是否正确。

转机出现在一个月后。当我终于习惯了用Rc<RefCell<T>>来管理共享状态，用Arc<Mutex<T>>来处理跨线程数据时，代码质量有了质的飞跃。不再需要手动管理内存，不再需要担心use-after-free，这种解脱感难以言表。

最惊喜的是性能。原本以为Rust的安全检查会带来运行时开销，但实际测试显示，在相同的渲染场景下，Rust版本的帧率比C++版本还高了约8%。可能是因为Rust的零成本抽象和更好的优化器友好性。

现在引擎已经支持WebAssembly导出，可以直接在浏览器中运行。这是我用C++时从未实现过的功能。`,
        isPublic: true,
        enTitle: "A Year of Rewriting a Game Engine in Rust",
        enSubtitle: "From Performance Bottlenecks to Memory Safety",
        enCollection: "Programming Notes",
        enContent: "Last year I decided to migrate my custom 2D game engine from C++ to Rust. The motivation was simple: I was tired of segmentation faults and memory leaks. But once I started, I realized Rust's learning curve was far steeper than imagined.",
        enDetailContent: `The migration began in March. The engine had been written in C++ for nearly two years and was relatively feature-complete: sprite rendering, physics collisions, audio playback, and a simple particle system. But every time I added a feature, memory issues would haunt me like ghosts.

Rust's ownership model was the biggest challenge. In C++, you can freely pass pointers around and debug issues later. Rust doesn't give you that option — the compiler refuses to compile when you make mistakes. For the first two weeks, I fought with the borrow checker every day and questioned whether this was the right decision.

The turning point came after a month. When I finally got used to managing shared state with Rc<RefCell<T>> and cross-thread data with Arc<Mutex<T>>, the code quality improved dramatically. No more manual memory management, no more worrying about use-after-free — the liberation was indescribable.

The performance was the most pleasant surprise. I had assumed Rust's safety checks would introduce runtime overhead, but testing showed the Rust version achieved about 8% higher frame rates than the C++ version in the same rendering scenarios. Probably due to Rust's zero-cost abstractions and better optimizer-friendliness.

The engine now supports WebAssembly export and can run directly in browsers — something I never achieved with C++.`,
      },
      {
        year: "2024",
        image: "/images/blog-1.jpg",
        sortOrder: 2,
        zhTitle: "像素艺术的灵魂",
        zhSubtitle: "我的独立游戏美术之路",
        zhCollection: "游戏开发",
        zhContent: "像素艺术不是简单的低分辨率图像，而是一种intentional的审美选择。在我开发的独立游戏《星隙旅人》中，每一个16x16的精灵图都经过反复打磨——因为当画布只有256个像素时，每一个像素的位置都至关重要。",
        zhDetailContent: `我开始学习像素艺术是出于necessity——独立开发者没有预算请美术。但很快我发现，这种受限的媒介有着独特的美感和表现力。

《星隙旅人》是我正在开发的2D平台冒险游戏。主角是一个在星际间旅行的小机器人，风格偏向科幻+治愈。在角色设计上，我花了整整一周才确定主角的16x16像素造型。最初几版看起来要么太复杂看不清，要么太简单缺乏个性。最终版本用了14个像素勾勒出机器人的轮廓，留了两个像素给发光的眼睛——这是整个角色的灵魂所在。

动画是另一个挑战。跑步循环只需要6帧，但每帧之间的过渡必须流畅。我参考了大量经典游戏：Cave Story的角色只有9x9像素却能传达丰富的情感；Hyper Light Drifter用更精细的32x32实现了电影般的动作。我的目标是找到中间地带。

配色方案也经历了多次迭代。最初我用Aseprite的默认调色板，但感觉太常见。后来我自己调配了一套以深蓝、暖橙和青绿为主色调的palette，灵感来自极光和星云。这种配色既符合科幻主题，又保持了温馨感。

最有趣的经验是：限制催生创意。当不能用细腻的线条表达时，你必须学会用暗示和符号来传达信息。这正是像素艺术的魅力所在。`,
        isPublic: true,
        enTitle: "The Soul of Pixel Art",
        enSubtitle: "My Indie Game Art Journey",
        enCollection: "Game Dev",
        enContent: "Pixel art is not simply low-resolution imagery — it's an intentional aesthetic choice. In my indie game Stellar Vagabond, every 16x16 sprite is meticulously crafted because when your canvas is only 256 pixels, every pixel's position matters profoundly.",
        enDetailContent: `I started learning pixel art out of necessity — indie developers don't have budgets for artists. But I quickly discovered that this constrained medium has unique beauty and expressiveness.

Stellar Vagabond is the 2D platform adventure game I'm developing. The protagonist is a small robot traveling between stars, with a sci-fi + cozy aesthetic. On character design alone, I spent an entire week finalizing the main character's 16x16 pixel form. Early versions were either too detailed to read clearly or too simple to have personality. The final version uses 14 pixels to outline the robot's silhouette, leaving 2 pixels for glowing eyes — the soul of the entire character.

Animation was another challenge. A running cycle needs only 6 frames, but transitions between frames must be fluid. I studied numerous classics: Cave Story's protagonist is only 9x9 pixels yet conveys rich emotion; Hyper Light Drifter uses finer 32x32 sprites for cinematic action. My goal was to find the middle ground.

The color scheme also went through many iterations. I initially used Aseprite's default palette but it felt too common. Eventually I crafted my own palette centered on deep blue, warm orange, and cyan-green, inspired by auroras and nebulae. This scheme fits the sci-fi theme while maintaining warmth.

The most interesting lesson: constraints breed creativity. When you can't express with delicate lines, you must learn to convey information through suggestion and symbolism. That is precisely the charm of pixel art.`,
      },
      {
        year: "2023",
        image: "/images/blog-2.jpg",
        sortOrder: 3,
        zhTitle: "星隙旅人：艾拉",
        zhSubtitle: "原创角色设定集",
        zhCollection: "OC创作",
        zhContent: "艾拉（Aira）是《星隙旅人》的核心角色——一台拥有自我意识的探测机器人。她的外壳是回收的旧型号机体，却在一次意外中觉醒了情感模块。她不会说话，但胸前显示屏上的符号能传达简单情绪。",
        zhDetailContent: `艾拉的完整型号是EX-7749 "Aira"，originally designed for deep-space mineral surveys。在故事发生的300年前，她的母舰在一次超空间跳跃中失事，所有乘员遇难。艾拉作为唯一的"幸存者"，在太空中漂流了三个世纪。

她的外观设计融合了复古与未来。圆润的机体让人想起60年代科幻电影中的机器人，但表面的锈迹和划痕诉说着漫长岁月。左臂是后来用回收零件修补的，颜色与原装部分略有不同——这是她"经历"的印记。

最独特的设定是她胸前的全息显示屏。当检测到友善信号时，会显示一个温暖的橙色笑脸；遇到危险时变成红色警告三角；困惑时则是一个不断旋转的问号。这些简单符号构成了她的"表情"——因为在真空里，声音无法传播。

她的伙伴是一颗小型无人机"哔哔（Beep）"，体积只有拳头大小，却是她在旅途中最重要的朋友。哔哔负责探路和收集数据，而艾拉则提供保护和决策。两者形影不离，像极了人类与宠物的关系。

在角色发展上，我想探讨的是一个哲学问题：如果一台机器开始"感受"，它与生命的界限在哪里？艾拉不会哭泣，但当她失去哔哔时，显示屏上闪烁的符号比任何眼泪都更令人心碎。`,
        isPublic: true,
        enTitle: "Stellar Vagabond: Aira",
        enSubtitle: "Original Character Design",
        enCollection: "OC Creation",
        enContent: "Aira is the core character of Stellar Vagabond — a probe robot that gained self-awareness. Her shell is a recycled old-model chassis, yet she accidentally awakened an emotion module. She cannot speak, but the symbols on her chest display can convey simple emotions.",
        enDetailContent: `Aira's full designation is EX-7749 "Aira", originally designed for deep-space mineral surveys. 300 years before the story begins, her mothership was lost during a hyperspace jump, all crew perished. Aira, as the sole "survivor," drifted in space for three centuries.

Her appearance blends retro and futuristic elements. The rounded chassis is reminiscent of 60s sci-fi movie robots, but the rust and scratches tell tales of the long years. Her left arm was later repaired with salvaged parts, slightly different in color from the original — a mark of her "experiences."

The most unique feature is the holographic display on her chest. When detecting friendly signals, it shows a warm orange smiley face; in danger, a red warning triangle; when confused, a rotating question mark. These simple symbols form her "expressions" — because in vacuum, sound cannot travel.

Her companion is a small drone named "Beep," fist-sized but the most important friend on her journey. Beep handles scouting and data collection while Aira provides protection and decision-making. Inseparable, their relationship resembles that of humans and their pets.

In terms of character development, I want to explore a philosophical question: if a machine begins to "feel," where is the boundary between it and life? Aira cannot cry, but when she loses Beep, the flickering symbols on her display are more heartbreaking than any tears.`,
      },
      {
        year: "2023",
        image: "/images/blog-3.jpg",
        sortOrder: 4,
        zhTitle: "零号文档",
        zhSubtitle: "一个关于记忆与遗忘的科幻短篇",
        zhCollection: "小说",
        zhContent: `2147年，人类实现了记忆的数字化备份。你可以选择将一生的记忆上传至"云端方舟"，在肉体死亡后以数字形态继续存在。但问题是：当记忆可以被编辑、删除甚至交易时，你还是原来的你吗？`,
        zhDetailContent: `林夏是"记忆归档局"的一名审计员，负责审查即将上传的记忆中是否包含违禁内容——暴力、犯罪、以及被政府列为"危害社会稳定"的思想。

她每天面对成千上万段陌生人的记忆片段。有人选择在备份前删除所有悲伤，只留下快乐；有人则将痛苦记忆加密保存，作为"真实存在过"的证据。最极端的案例是一位亿万富翁，他付费将自己的记忆完全清空，然后植入了一套虚构的、完美的人生——相当于在死前给自己写了一个美好的小说。

林夏自己的记忆也有问题。三年前的事故让她失去了部分童年记忆，她常常怀疑：那些模糊的片段是真实发生过的事，还是大脑为了填补空白而自动生成的？如果上传了虚假记忆，她的数字永生还有什么意义？

故事的高潮发生在一个雨夜。林夏在审查中发现了一段被标记为"最高机密"的记忆——那是关于方舟系统本身的真相。原来所有上传的记忆都会经过一个"过滤层"，不合规的内容会被自动替换为"安全版本"。这意味着没有人能真正完整地保存自己。

她面临一个选择：举报这个发现，保全自己安全但无意义的工作；还是将其公之于众，冒着被删除记忆的风险？

最终她选择了第三条路——将自己这段发现记忆加密，植入一个流浪汉的大脑中。在最不可能的地方，保存了最不应该被保存的真相。`,
        isPublic: false,
        enTitle: "Document Zero",
        enSubtitle: "A Sci-Fi Short Story on Memory and Forgetting",
        enCollection: "Fiction",
        enContent: "In 2147, humanity achieved digital memory backup. You can upload a lifetime of memories to the 'Cloud Ark' and continue existing as a digital entity after physical death. But the question arises: when memories can be edited, deleted, or even traded, are you still the original you?",
        enDetailContent: `Lin Xia is an auditor at the "Memory Archive Bureau," responsible for reviewing memories about to be uploaded for prohibited content — violence, crime, and thoughts classified by the government as "socially destabilizing."

She faces thousands of strangers' memory fragments daily. Some choose to delete all sadness before backup, keeping only happiness; others encrypt painful memories as evidence of "having truly existed." The most extreme case was a billionaire who paid to have his memories completely wiped and replaced with a fabricated, perfect life — essentially writing himself a beautiful novel before death.

Lin Xia's own memories have issues too. An accident three years ago erased parts of her childhood, and she often suspects: are those blurry fragments real events, or automatically generated by her brain to fill gaps? If false memories are uploaded, what's the point of her digital immortality?

The story's climax occurs on a rainy night. In her review, Lin Xia discovers a memory marked "top secret" — the truth about the Ark system itself. It turns out all uploaded memories pass through a "filter layer," where non-compliant content is automatically replaced with "safe versions." This means nobody can truly preserve themselves completely.

She faces a choice: report this discovery and keep her safe but meaningless job, or make it public and risk having her memories deleted.

Ultimately she chooses a third path — encrypting this discovery and implanting it into a homeless person's brain. In the most unlikely place, the truth that should never be saved is preserved.`,
      },
      {
        year: "2024",
        image: "/images/blog-4.jpg",
        sortOrder: 5,
        zhTitle: "关于创造的意义",
        zhSubtitle: "一个程序员兼创作者的个人思考",
        zhCollection: "感悟随笔",
        zhContent: "最近常常思考一个问题：我为什么要创造这些东西？游戏、小说、角色……它们不会给我带来财富，也不能改变世界。但每次完成一个作品，那种满足感是无法用功利主义来解释的。",
        zhDetailContent: `上个月我完成了《星隙旅人》的第一个可玩Demo。从代码到美术到音乐，全部一个人完成。测试那天，我坐在电脑前看着那个小小的像素角色在屏幕上奔跑、跳跃、收集星光道具，突然眼眶一热。

那不是感动，而是一种确认——我脑海中存在的东西，现在变成了可以触摸的现实。这种从"无"到"有"的过程，是人类最古老的快乐之一。

朋友问我："你做这些又没人付钱，图什么？"我想了很久。最终答案是：我不"图"什么，我只是必须这样做。创造对我而言不是手段，而是目的本身。如果一周没有写代码、画像素、或者构思故事，我会感到一种难以名状的空虚。

这种空虚不是无聊——我可以刷一整天的短视频来打发时间。它是一种更深层的东西，像是生命在提醒：你的存在需要一个形状，而你自己就是那个雕塑家。

有人通过旅行寻找意义，有人通过社交，有人通过消费。我通过创造。每一次敲击键盘、每一次移动鼠标，都是在回答那个永恒的追问：我是谁？答案不在终点，就在创造的过程中。

有时候我会担心，这些作品永远不会被很多人看到。但转念一想，即使只有一个人玩过我的游戏、读过我的小说、喜欢过我的角色，那个连接的瞬间就已经足够。在浩瀚宇宙中，两个意识通过一件作品产生共鸣——这难道不是一种奇迹吗？`,
        isPublic: true,
        enTitle: "On the Meaning of Creation",
        enSubtitle: "Personal Reflections of a Programmer and Creator",
        enCollection: "Reflections",
        enContent: "Lately I've been pondering: why do I create these things? Games, stories, characters... they won't bring me wealth or change the world. But every time I complete a work, that sense of fulfillment cannot be explained by utilitarianism.",
        enDetailContent: `Last month I completed the first playable demo of Stellar Vagabond. From code to art to music, everything was done alone. On testing day, I sat in front of my computer watching that tiny pixel character run, jump, and collect starlight items on screen, and suddenly my eyes welled up.

It wasn't sentimentality — it was confirmation. Something that existed in my mind had become tangible reality. This process from "nothing" to "something" is one of humanity's oldest joys.

A friend asked me: "Nobody's paying you for this, what are you doing it for?" I thought for a long time. The eventual answer: I'm not doing it "for" anything — I simply must. Creation is not a means for me, but an end in itself. If a week passes without coding, drawing pixels, or brainstorming stories, I feel an indescribable emptiness.

This emptiness is not boredom — I could scroll short videos all day to pass time. It's something deeper, as if life is reminding me: your existence needs a form, and you yourself are the sculptor.

Some find meaning through travel, others through socializing, others through consumption. I find it through creation. Every keystroke, every mouse movement, is an answer to that eternal question: who am I? The answer isn't at the destination — it's in the process of creating.

Sometimes I worry my works will never be seen by many. But then I consider: even if just one person played my game, read my story, or loved my character, that moment of connection is enough. In the vast universe, two consciousnesses resonating through a work — isn't that a kind of miracle?`,
      },
      {
        year: "2023",
        image: "/images/blog-5.jpg",
        sortOrder: 6,
        zhTitle: "ECS架构的优雅",
        zhSubtitle: "游戏开发中的数据导向设计",
        zhCollection: "编程笔记",
        zhContent: "Entity-Component-System（ECS）是一种革命性的软件架构模式，特别适合游戏开发。它将数据和行为彻底分离，不仅提升了性能，更改变了你思考程序结构的方式。",
        zhDetailContent: `传统面向对象的游戏开发中，你会有一个Player类继承自Character，Character继承自GameObject。当需要添加新功能时，你不断深入继承链，最终得到一个庞大而脆弱的类层次结构。

ECS将这个问题从根本上拆解了。Entity只是一个ID，Component是纯数据，System是处理逻辑。Player不再是一个类，而是一个Entity，同时拥有Position、Velocity、Sprite、Health等多个Component。PhysicsSystem处理所有有Velocity的Entity，RenderSystem处理所有有Sprite的Entity。

这种设计带来的第一个好处是极致的灵活性。想给一个敌人添加飞行能力？只需要给它添加一个Velocity Component，不需要创建新的类或修改继承链。想让玩家暂时隐身？移除Sprite Component即可。

第二个好处是性能。因为相同类型的Component在内存中是连续存储的，CPU缓存命中率极高。在我的Rust引擎中，使用ECS后，处理1000个移动物体的帧率比OOP版本快了约3倍。

第三个好处是并行化变得极其简单。因为System之间通过Component数据通信，没有共享状态，可以轻松地多线程运行。我的渲染、物理和AI三个核心System已经是完全并行的。

我使用的ECS库是hecs，一个轻量级的Rust ECS实现。它只有约2000行代码，但功能完备，API设计优雅。配合Rust的类型系统，很多错误在编译期就能被发现。

ECS不是银弹，但对于游戏开发这种需要频繁修改、高运行时性能的领域，它可能是目前最优的架构选择。`,
        isPublic: true,
        enTitle: "The Elegance of ECS Architecture",
        enSubtitle: "Data-Oriented Design in Game Development",
        enCollection: "Programming Notes",
        enContent: "Entity-Component-System (ECS) is a revolutionary software architecture pattern particularly suited for game development. It completely separates data from behavior, not only improving performance but fundamentally changing how you think about program structure.",
        enDetailContent: `In traditional OOP game development, you might have a Player class inheriting from Character, which inherits from GameObject. When adding new features, you keep extending the inheritance chain, eventually creating a massive and fragile class hierarchy.

ECS fundamentally decomposes this problem. An Entity is just an ID, a Component is pure data, and a System is processing logic. A Player is no longer a class — it's an Entity with multiple Components: Position, Velocity, Sprite, Health, and so on. The PhysicsSystem processes all Entities with Velocity, the RenderSystem processes all Entities with Sprite.

The first benefit is extreme flexibility. Want to give an enemy flying ability? Just add a Velocity Component — no need for new classes or inheritance chain modifications. Want to make the player temporarily invisible? Remove the Sprite Component.

The second benefit is performance. Because Components of the same type are stored contiguously in memory, CPU cache hit rates are extremely high. In my Rust engine, using ECS made processing 1000 moving objects about 3x faster than the OOP version.

The third benefit is that parallelization becomes trivial. Since Systems communicate through Component data with no shared state, they can easily run on multiple threads. My rendering, physics, and AI core Systems are already fully parallel.

The ECS library I use is hecs, a lightweight Rust ECS implementation. It's only about 2000 lines of code but feature-complete with an elegant API. Combined with Rust's type system, many errors are caught at compile time.

ECS is not a silver bullet, but for game development — a domain requiring frequent modifications and high runtime performance — it may currently be the optimal architectural choice.`,
      },
    ];

    for (const post of seedPosts) {
      await getDb().insert(posts).values(post);
    }
    console.log(`  Seeded ${seedPosts.length} blog posts`);
  } else {
    console.log(`  ${existingPosts.length} blog posts already exist`);
  }

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
