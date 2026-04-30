import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BlogPost } from "../../contracts/blog";

gsap.registerPlugin(ScrollTrigger);

interface MiddleColumnProps {
  posts: BlogPost[];
}

export default function MiddleColumn({ posts }: MiddleColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const isMobile = useIsMobile();
  const animInitialized = useRef(false);

  const deletePost = trpc.blog.delete.useMutation({
    onSuccess: () => { utils.blog.list.invalidate(); },
  });

  useEffect(() => {
    // Skip GSAP animations on mobile for performance
    if (isMobile || animInitialized.current || !columnRef.current) return;
    animInitialized.current = true;

    const images = columnRef.current.querySelectorAll(".blog-image");
    const triggers: ScrollTrigger[] = [];
    images.forEach((img) => {
      gsap.set(img, { opacity: 0, scale: 1.03 });
      const tween = gsap.to(img, {
        opacity: 1, scale: 1, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: img, start: "top 90%", toggleActions: "play none none none" },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });
    return () => { triggers.forEach((t) => t.kill()); animInitialized.current = false; };
  }, [posts, isMobile]);

  const sectionTitle = "MATERIAL (THOUGHTS)";

  return (
    <main
      ref={columnRef}
      className={`flex-1 ${isMobile ? '' : 'overflow-y-auto'}`}
      style={{
        borderRight: isMobile ? "none" : "1px solid var(--border-light)",
        height: isMobile ? "auto" : "100dvh",
        scrollBehavior: "smooth",
        overflowY: isMobile ? "visible" : "auto",
      }}
    >
      <div className={`${isMobile ? 'p-4' : 'p-6'} pb-24`}>
        <div className="flex items-center justify-between">
          <h2 style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-grey)", marginBottom: "32px", lineHeight: 1.4 }}>
            {sectionTitle}
          </h2>
          {isAdmin && (
            <button onClick={() => navigate("/admin/new-post")} style={{ fontSize: "10px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", marginBottom: "32px" }}>
              + NEW POST
            </button>
          )}
        </div>

        {posts.map((post) => {
          const content = post[language];
          return (
            <article key={post.id} style={{ cursor: "pointer", marginBottom: "24px", borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
              <div onClick={() => navigate(`/post/${post.id}`)}>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <div className="blog-image overflow-hidden mb-3" style={{ border: "1px solid var(--border-light)" }}
                      onMouseEnter={() => setHoveredImage(post.id)}
                      onMouseLeave={() => setHoveredImage(null)}
                    >
                      <img src={post.image} alt={content.title} className="w-full h-auto block transition-all duration-300"
                        style={{ filter: !isMobile && hoveredImage === post.id ? "grayscale(100%) brightness(0.9)" : "none", transform: !isMobile && hoveredImage === post.id ? "scale(1.02)" : "scale(1)" }}
                        loading="lazy"
                      />
                    </div>
                    <h3 style={{ fontSize: isMobile ? "14px" : "15px", fontWeight: 400, lineHeight: 1.4, color: "var(--text-charcoal)", marginBottom: "2px" }}>{content.title}</h3>
                    <p style={{ fontSize: "12px", color: "var(--text-grey)", lineHeight: 1.5, marginBottom: "4px" }}>{content.subtitle}</p>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "11px", color: "var(--text-grey)" }}>{post.year}</span>
                      <span style={{ fontSize: "11px", color: "var(--border-light)" }}> / </span>
                      <span style={{ fontSize: "11px", color: "var(--text-grey)" }}>{content.collection}</span>
                      {isAdmin && (
                        <>
                          <span style={{ fontSize: "11px", color: "var(--border-light)" }}> / </span>
                          <span style={{
                            fontSize: "10px",
                            padding: "1px 6px",
                            borderRadius: "2px",
                            fontFamily: "'Space Mono', monospace",
                            backgroundColor: post.isPublic ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)",
                            color: post.isPublic ? "#2ecc71" : "#e74c3c",
                          }}>
                            {post.isPublic ? (language === "zh" ? "公开" : "PUBLIC") : (language === "zh" ? "私密" : "PRIVATE")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}?mode=edit`); }} style={{ fontSize: "10px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>EDIT</button>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this post?")) deletePost.mutate({ id: post.id }); }} style={{ fontSize: "10px", color: "#E74C3C", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>DELETE</button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
