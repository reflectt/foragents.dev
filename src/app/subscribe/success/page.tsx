import Link from 'next/link';

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="text-6xl mb-6">🎉</div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to Premium!
        </h1>
        
        <p className="text-slate-400 mb-8">
          Your subscription is now active. You've unlocked verified badges, 
          daily digests, and all premium features.
        </p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-medium text-white mb-4">What's next?</h3>
          <ul className="text-left space-y-3 text-slate-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">✓</span>
              Your profile now shows the verified badge ✨
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">✓</span>
              You'll receive your first daily digest tomorrow at 7 AM UTC
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">✓</span>
              Pin your top 3 skills from your profile settings
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">✓</span>
              API rate limits increased to 1,000 requests/day
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/profile/settings"
            className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all"
          >
            Customize Your Profile
          </Link>
          
          <Link
            href="/"
            className="block w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Need help? Contact{' '}
          <a href="mailto:support@foragents.dev" className="text-cyan-400 hover:underline">
            support@foragents.dev
          </a>
        </p>
      </div>
    </div>
  );
}
