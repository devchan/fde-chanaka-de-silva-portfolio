"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { blogCategories } from "@/data/blog";
import type { BlogPost } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const categories = ["All", ...blogCategories] as const;

export function BlogFilter({ posts }: { posts: BlogPost[] }) {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory =
        category === "All" || post.category === category;
      const matchesQuery =
        q.length === 0 ||
        [post.title, post.description, post.category, ...post.tags]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, posts, query]);

  return (
    <div>
      <div className="mb-8 grid gap-4">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search articles</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search engineering notes"
            className="pl-9"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Blog categories">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cn(
                "h-9 rounded-lg border px-3 text-sm transition-colors",
                category === item
                  ? "border-transparent bg-foreground text-background"
                  : "border-card-border bg-surface text-muted hover:text-foreground"
              )}
              role="tab"
              aria-selected={category === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {filtered.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-lg border border-card-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-surface"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{post.category}</Badge>
              <span className="font-mono text-xs text-muted">
                {formatDate(post.date)} / {post.readingTime}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-normal group-hover:text-gradient">
              {post.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {post.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-md bg-surface px-2 py-1 font-mono text-[11px] text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
