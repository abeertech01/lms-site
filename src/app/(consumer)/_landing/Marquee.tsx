const topics = [
  "JavaScript",
  "Node.js",
  "REST APIs",
  "Machine Learning",
  "Python",
  "Deployment",
  "Neural Nets",
  "Databases",
]

export function Marquee() {
  return (
    <section
      aria-label="Topics covered"
      className="bg-lime border-foreground border-y overflow-hidden whitespace-nowrap"
    >
      <div className="flex py-5 w-max font-semibold text-[22px] text-foreground tracking-[-0.02em] animate-marquee">
        {/* NOTE: the list is rendered twice and the track moves -50%, so the loop is seamless. */}
        {[false, true].map((hidden) => (
          <div key={String(hidden)} className="flex" aria-hidden={hidden}>
            {topics.map((topic) => (
              <span key={topic} className="flex items-center gap-12 pr-12">
                <span>{topic}</span>
                <span className="text-accent">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
