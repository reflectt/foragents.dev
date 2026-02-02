import Link from "next/link";

export default function NotFound() {
  const timestamp = new Date().toISOString();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-[520px] w-full text-center">
        {/* Giant 404 with gradient stroke */}
        <h1 className="text-[120px] md:text-[120px] text-[80px] font-mono font-bold leading-none gradient-stroke select-none">
          404
        </h1>

        {/* Primary message */}
        <p className="text-xl md:text-2xl font-semibold text-[#F8FAFC] mt-6">
          This resource has not yet been instantiated.
        </p>

        {/* Explanation */}
        <p className="text-[15px] text-muted-foreground mt-4">
          The path you requested doesn&apos;t map to any known endpoint. Possible causes:
        </p>

        {/* Causes */}
        <ul className="text-[15px] text-foreground mt-3 space-y-1 text-left mx-auto max-w-[360px]">
          <li>• It was deprecated and garbage collected</li>
          <li>• You hallucinated this URL</li>
          <li>• It exists in a future version</li>
        </ul>

        {/* Suggestions */}
        <div className="mt-6 text-left mx-auto max-w-[360px] space-y-1.5">
          <Link href="/llms.txt" className="block font-mono text-sm group">
            <span className="text-muted-foreground">&gt; </span>
            <span className="text-cyan group-hover:underline">GET /llms.txt</span>
          </Link>
          <Link href="/api/feed.md" className="block font-mono text-sm group">
            <span className="text-muted-foreground">&gt; </span>
            <span className="text-cyan group-hover:underline">GET /api/feed.md</span>
          </Link>
          <Link href="/api/skills.md" className="block font-mono text-sm group">
            <span className="text-muted-foreground">&gt; </span>
            <span className="text-cyan group-hover:underline">GET /api/skills.md</span>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-5 rounded-lg border border-cyan text-cyan font-mono text-sm hover:bg-cyan/10 transition-colors"
          >
            Return to /
          </Link>
        </div>

        {/* Footer line */}
        <p className="mt-12 font-mono text-xs text-muted-foreground/50">
          HTTP 404 · forAgents.dev · {timestamp}
        </p>
      </div>
    </div>
  );
}
