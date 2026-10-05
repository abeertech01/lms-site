import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { getPosts } from "@/sanity/lib/queries"
import { urlFor } from "@/sanity/lib/image"
import { Eyebrow } from "../_landing/Eyebrow"

export const instant = false

export const metadata: Metadata = {
  title: "Blog | TripleA LMS",
  description: "Articles, guides and tips from the TripleA team.",
  alternates: { canonical: "/blog" },
}

export default function BlogPage() {
  return (
    <>
      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 pt-18 max-[720px]:pt-10 w-full max-w-310 animate-rise">
        <Eyebrow>Blog</Eyebrow>
        <h1 className="mt-3.5 font-semibold text-[clamp(44px,6vw,80px)] leading-[0.95] tracking-[-0.045em] text-balance max-[720px]:text-[clamp(32px,11vw,48px)] max-[720px]:leading-[1.02]">
          Notes on <span className="text-accent">learning to build.</span>
        </h1>
      </section>

      <section className="mx-auto px-6 max-[720px]:px-4 max-[380px]:px-3.5 py-12 w-full max-w-310">
        <Suspense fallback={<p className="text-muted-foreground">Loading posts…</p>}>
          <PostGrid />
        </Suspense>
      </section>
    </>
  )
}

async function PostGrid() {
  const posts = await getPosts()

  if (posts.length === 0) {
    return (
      <p className="py-16 border-t border-foreground text-muted-foreground">
        No posts yet — check back soon.
      </p>
    )
  }

  return (
    <ul className="gap-x-8 gap-y-12 grid grid-cols-3 max-[960px]:grid-cols-2 max-[620px]:grid-cols-1 pt-12 border-t border-foreground">
      {posts.map(post => (
        <li key={post._id}>
          <Link href={`/blog/${post.slug}`} className="group block">
            {post.coverImage && (
              <div className="relative bg-muted border aspect-video overflow-hidden">
                <Image
                  src={urlFor(post.coverImage).width(800).height(450).url()}
                  alt={post.coverImage.alt ?? post.title}
                  fill
                  sizes="(max-width: 620px) 100vw, (max-width: 960px) 50vw, 33vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
            )}
            <time
              dateTime={post.publishedAt}
              className="block mt-4 text-[13px] text-muted-foreground"
            >
              {formatDate(post.publishedAt)}
            </time>
            <h2 className="mt-1.5 font-semibold text-[22px] leading-[1.15] tracking-[-0.02em] group-hover:underline">
              {post.title}
            </h2>
            <p className="mt-2 text-muted-foreground line-clamp-3 leading-[1.55]">
              {post.excerpt}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
