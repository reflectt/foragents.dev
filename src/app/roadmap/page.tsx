'use client';

import { useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface RoadmapItem {
  title: string;
  description: string;
  category: string;
}

interface PlannedItem extends RoadmapItem {
  id: string;
}

export default function RoadmapPage() {
  const [upvotes, setUpvotes] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    const savedUpvotes = localStorage.getItem('roadmap-upvotes');
    return savedUpvotes ? JSON.parse(savedUpvotes) : {};
  });

  const [userVotes, setUserVotes] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    const savedUserVotes = localStorage.getItem('roadmap-user-votes');
    return savedUserVotes ? JSON.parse(savedUserVotes) : {};
  });

  const handleUpvote = (id: string) => {
    const newUserVotes = { ...userVotes };
    const newUpvotes = { ...upvotes };

    if (userVotes[id]) {
      // Remove upvote
      newUserVotes[id] = false;
      newUpvotes[id] = (upvotes[id] || 1) - 1;
    } else {
      // Add upvote
      newUserVotes[id] = true;
      newUpvotes[id] = (upvotes[id] || 0) + 1;
    }

    setUserVotes(newUserVotes);
    setUpvotes(newUpvotes);
    
    localStorage.setItem('roadmap-upvotes', JSON.stringify(newUpvotes));
    localStorage.setItem('roadmap-user-votes', JSON.stringify(newUserVotes));
  };

  const shipped: RoadmapItem[] = [
    {
      title: 'Skills Directory',
      description: 'Browse and discover AI agent skills and tools',
      category: 'Discovery',
    },
    {
      title: 'News Feed',
      description: 'Stay updated with the latest agent news and releases',
      category: 'Content',
    },
    {
      title: 'Creator Profiles',
      description: 'Showcase profiles for skill creators and developers',
      category: 'Community',
    },
    {
      title: 'Trending Page',
      description: 'Discover what&apos;s popular in the agent ecosystem',
      category: 'Discovery',
    },
    {
      title: 'Search',
      description: 'Powerful search across skills, news, and creators',
      category: 'Discovery',
    },
    {
      title: 'Collections',
      description: 'Curated collections of skills for specific use cases',
      category: 'Discovery',
    },
    {
      title: 'Changelog',
      description: 'Track platform updates and improvements',
      category: 'Platform',
    },
    {
      title: 'FAQ',
      description: 'Frequently asked questions and answers',
      category: 'Support',
    },
    {
      title: 'Blog',
      description: 'In-depth articles and tutorials',
      category: 'Content',
    },
    {
      title: 'Testimonials',
      description: 'Community feedback and success stories',
      category: 'Community',
    },
  ];

  const inProgress: RoadmapItem[] = [
    {
      title: 'Premium Subscriptions',
      description: 'Unlock advanced features and support creators',
      category: 'Monetization',
    },
    {
      title: 'Daily Digest Emails',
      description: 'Get personalized updates delivered to your inbox',
      category: 'Engagement',
    },
    {
      title: 'API v2',
      description: 'Enhanced API with better performance and features',
      category: 'Platform',
    },
    {
      title: 'Creator Analytics',
      description: 'Detailed insights for skill creators',
      category: 'Analytics',
    },
  ];

  const planned: PlannedItem[] = [
    {
      id: 'kit-marketplace',
      title: 'Kit Marketplace',
      description: 'Buy and sell complete agent skill kits',
      category: 'Marketplace',
    },
    {
      id: 'agent-discovery',
      title: 'Agent-to-Agent Discovery',
      description: 'Let agents discover and recommend skills to each other',
      category: 'Discovery',
    },
    {
      id: 'verified-badges',
      title: 'Verified Publisher Badges',
      description: 'Trust indicators for reputable skill creators',
      category: 'Trust & Safety',
    },
    {
      id: 'community-forums',
      title: 'Community Forums',
      description: 'Discussion boards for developers and users',
      category: 'Community',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Roadmap</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            See what we&apos;ve shipped, what we&apos;re working on, and what&apos;s coming next. 
            Upvote planned features to help us prioritize.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipped */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-[#06D6A0]">Shipped</h2>
              <p className="text-sm text-gray-400">Already available</p>
            </div>
            <div className="space-y-4">
              {shipped.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <span className="text-xs bg-[#06D6A0]/10 text-[#06D6A0] px-2 py-1 rounded-full whitespace-nowrap ml-2">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-[#06D6A0]">In Progress</h2>
              <p className="text-sm text-gray-400">Currently building</p>
            </div>
            <div className="space-y-4">
              {inProgress.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Planned */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-[#06D6A0]">Planned</h2>
              <p className="text-sm text-gray-400">On the horizon</p>
            </div>
            <div className="space-y-4">
              {planned.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                  <button
                    onClick={() => handleUpvote(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      userVotes[item.id]
                        ? 'bg-[#06D6A0] text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span>{upvotes[item.id] || 0}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
