export default function OpenSourcePage() {
  const contributeCards = [
    {
      title: 'Report Issues',
      description: 'Found a bug or have a feature request? Let us know on GitHub.',
      icon: '🐛',
      link: 'https://github.com/reflectt/foragents.dev/issues/new',
    },
    {
      title: 'Submit PRs',
      description: 'Fix bugs, add features, or improve existing code.',
      icon: '🔧',
      link: 'https://github.com/reflectt/foragents.dev/pulls',
    },
    {
      title: 'Add Skills',
      description: 'Contribute new agent skills to expand the ecosystem.',
      icon: '⚡',
      link: 'https://github.com/reflectt/foragents.dev/tree/main/skills',
    },
    {
      title: 'Improve Docs',
      description: 'Help make our documentation clearer and more comprehensive.',
      icon: '📚',
      link: 'https://github.com/reflectt/foragents.dev/tree/main/docs',
    },
  ];

  const goodFirstIssues = [
    {
      id: 1,
      title: 'Add dark mode toggle animation',
      labels: ['good first issue', 'enhancement'],
      link: '#',
    },
    {
      id: 2,
      title: 'Fix typo in contribution guidelines',
      labels: ['good first issue', 'documentation'],
      link: '#',
    },
    {
      id: 3,
      title: 'Improve mobile responsiveness on skills page',
      labels: ['good first issue', 'help wanted'],
      link: '#',
    },
    {
      id: 4,
      title: 'Add more examples to README',
      labels: ['documentation', 'help wanted'],
      link: '#',
    },
    {
      id: 5,
      title: 'Update dependencies to latest versions',
      labels: ['good first issue', 'maintenance'],
      link: '#',
    },
    {
      id: 6,
      title: 'Add unit tests for utility functions',
      labels: ['good first issue', 'testing'],
      link: '#',
    },
  ];

  const stats = [
    { label: 'Stars', value: '1,234' },
    { label: 'Forks', value: '256' },
    { label: 'Contributors', value: '42' },
  ];

  const labelColors: Record<string, string> = {
    'good first issue': 'bg-green-500/20 text-green-400 border-green-500/30',
    'help wanted': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'documentation': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'enhancement': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'maintenance': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'testing': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06D6A0]/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-[#06D6A0] to-white bg-clip-text text-transparent">
              forAgents.dev is Open Source
            </h1>
            <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto">
              Built by the community, for the community. Join us in shaping the future of agent development.
            </p>
          </div>
        </div>
      </section>

      {/* Why Open Source */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
          Why Open Source?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:border-[#06D6A0]/50 transition-colors">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-3 text-[#06D6A0]">Transparency</h3>
            <p className="text-gray-400">
              Every line of code is visible. No black boxes, no hidden agendas. See exactly how your agents work.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:border-[#06D6A0]/50 transition-colors">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-3 text-[#06D6A0]">Community Trust</h3>
            <p className="text-gray-400">
              Open source builds trust through peer review, security audits, and collaborative improvement.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:border-[#06D6A0]/50 transition-colors">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-3 text-[#06D6A0]">Faster Innovation</h3>
            <p className="text-gray-400">
              Hundreds of minds are better than one. Community contributions accelerate development and innovation.
            </p>
          </div>
        </div>
      </section>

      {/* How to Contribute */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
          How to Contribute
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contributeCards.map((card) => (
            <a
              key={card.title}
              href={card.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-[#06D6A0] hover:bg-white/10 transition-all group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#06D6A0]">
                {card.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {card.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Good First Issues */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
          Good First Issues
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          New to the project? Start here! These issues are perfect for first-time contributors.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {goodFirstIssues.map((issue) => (
            <a
              key={issue.id}
              href={issue.link}
              className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-[#06D6A0]/50 hover:bg-white/10 transition-all"
            >
              <h3 className="text-lg font-medium mb-3">{issue.title}</h3>
              <div className="flex flex-wrap gap-2">
                {issue.labels.map((label) => (
                  <span
                    key={label}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      labelColors[label] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* GitHub Stats */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
          GitHub Stats
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gradient-to-br from-[#06D6A0]/10 to-transparent border border-[#06D6A0]/30 rounded-lg p-8 text-center"
            >
              <div className="text-5xl font-bold text-[#06D6A0] mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* License */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">MIT License</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            forAgents.dev is free and open source software licensed under the MIT License. 
            You&apos;re free to use, modify, and distribute it as you see fit.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Contribute?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join our community and help build the future of agent development.
          </p>
          <a
            href="https://github.com/reflectt/foragents.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#06D6A0] hover:bg-[#05c794] text-black font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Star us on GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
