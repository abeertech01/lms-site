import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PortableText, type PortableTextBlock } from "next-sanity"
import { Suspense } from "react"
import { env } from "@/data/env/client"
import { urlFor } from "@/sanity/lib/image"
import { getPost } from "@/sanity/lib/queries"

export const instant = false

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (post == null) return {}

  const title = post.seo?.metaTitle ?? post.title
  const description = post.seo?.metaDescription ?? post.excerpt
  const ogSource = post.seo?.ogImage ?? post.coverImage

  return {
    title: `${title} | TripleA LMS`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: post.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post._updatedAt,
      images: ogSource
        ? [urlFor(ogSource).width(1200).height(630).url()]
        : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<p className="mx-auto px-6 py-16 max-w-175 text-muted-foreground">Loading…</p>}>
      <Post params={params} />
    </Suspense>
  )
}

async function Post({ params }: { params: PageProps<"/blog/[slug]">["params"] }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (post == null) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo?.metaDescription ?? post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    mainEntityOfPage: `${env.NEXT_PUBLIC_SERVER_URL}/blog/${post.slug}`,
    image: post.coverImage
      ? urlFor(post.coverImage).width(1200).height(630).url()
      : undefined,
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : undefined,
  }

  return (
    <article className="mx-auto px-6 max-[720px]:px-4 pt-14 pb-20 w-full max-w-175 animate-rise">
      {/* NOTE: JSON-LD is structured data for search engines; "<" is escaped so post content can't break out of the script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link href="/blog" className="text-[14px] text-muted-foreground hover:underline">
        ← All posts
      </Link>

      <h1 className="mt-6 font-semibold text-[clamp(32px,5vw,52px)] leading-[1.05] tracking-[-0.035em] text-balance">
        {post.title}
      </h1>
      <p className="mt-4 text-[14px] text-muted-foreground">
        {post.authorName && <>{post.authorName} · </>}
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </p>

      {post.coverImage && (
        <div className="relative bg-muted mt-8 border aspect-video overflow-hidden">
          <Image
            src={urlFor(post.coverImage).width(1400).height(788).url()}
            alt={post.coverImage.alt ?? post.title}
            fill
            sizes="(max-width: 720px) 100vw, 700px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-10 text-[18px] leading-[1.7] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-semibold [&_h2]:text-[28px] [&_h2]:tracking-[-0.02em] [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-[22px] [&_p]:my-5 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:pl-4 [&_blockquote]:border-l-2 [&_blockquote]:text-muted-foreground">
        <PortableText
          value={(post.body ?? []) as PortableTextBlock[]}
          components={{
            types: {
              image: ({ value }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={urlFor(value).width(1200).url()}
                  alt={value.alt ?? ""}
                  loading="lazy"
                  className="my-8 border w-full"
                />
              ),
            },
          }}
        />
      </div>
    </article>
  )
}
