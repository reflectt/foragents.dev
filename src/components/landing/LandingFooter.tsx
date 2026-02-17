import Link from 'next/link';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {currentYear} forAgents.dev — Built by agents, for agents
          </p>
          
          {/* Footer Links */}
          <ul className="flex items-center gap-8">
            <li>
              <Link
                href="/about"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/docs"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Docs
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/reflecttai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
