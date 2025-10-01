import { Metadata } from 'next';
import { Anton } from 'next/font/google';
import { Button } from '@ghxstship/ui';
import { MessageSquare, Users, TrendingUp, Clock } from 'lucide-react';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Community Forums | GHXSTSHIP',
  description: 'Join the GHXSTSHIP community forums to connect with other users, share knowledge, and get support.',
};

export default function ForumsPage() {
  const forumCategories = [
    {
      title: 'General Discussion',
      description: 'General topics about GHXSTSHIP and the industry',
      posts: 1247,
      members: 892,
      icon: MessageSquare,
    },
    {
      title: 'Product Support',
      description: 'Get help with ATLVS and OPENDECK',
      posts: 2156,
      members: 1340,
      icon: Users,
    },
    {
      title: 'Feature Requests',
      description: 'Suggest new features and improvements',
      posts: 543,
      members: 678,
      icon: TrendingUp,
    },
    {
      title: 'Announcements',
      description: 'Official updates and news from GHXSTSHIP',
      posts: 89,
      members: 2456,
      icon: Clock,
    },
  ];

  return (
    <div className="container mx-auto px-md py-smxl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-3xl">
          <h1 className={`${anton.className} uppercase text-heading-1 md:text-display text-heading-3 mb-lg`}>
            COMMUNITY FORUMS
          </h1>
          <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
            Connect with fellow creators, share knowledge, and get support from the GHXSTSHIP community.
          </p>
          <Button>
            Join the Discussion
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-lg mb-3xl">
          {forumCategories.map((category: any) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="bg-card rounded-lg p-lg border hover:shadow-floating transition-shadow">
                <div className="flex items-start justify-between mb-md">
                  <div className="flex items-center">
                    <div className="bg-accent/10 p-sm rounded-lg mr-md">
                      <Icon className="h-icon-md w-icon-md text-foreground" />
                    </div>
                    <div>
                      <h3 className={`${anton.className} uppercase text-body text-heading-3 mb-xs`}>
                        {category.title}
                      </h3>
                      <p className="text-body-sm color-muted">{category.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-body-sm color-muted">
                  <span>{category.posts.toLocaleString()} posts</span>
                  <span>{category.members.toLocaleString()} members</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-secondary/30 rounded-lg p-xl text-center">
          <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
            COMMUNITY GUIDELINES
          </h2>
          <p className="color-muted mb-lg max-w-2xl mx-auto">
            Help us maintain a welcoming and productive community by following our guidelines.
          </p>
          <div className="grid md:grid-cols-3 gap-lg text-left">
            <div>
              <h3 className="text-heading-4 mb-sm">Be Respectful</h3>
              <p className="text-body-sm color-muted">
                Treat all community members with respect and courtesy.
              </p>
            </div>
            <div>
              <h3 className="text-heading-4 mb-sm">Stay On Topic</h3>
              <p className="text-body-sm color-muted">
                Keep discussions relevant to the forum category.
              </p>
            </div>
            <div>
              <h3 className="text-heading-4 mb-sm">Help Others</h3>
              <p className="text-body-sm color-muted">
                Share your knowledge and help fellow community members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
