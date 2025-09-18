import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, MessageCircle, Users, Calendar, Trophy, ExternalLink, Github, Twitter, Youtube, Instagram, Twitch, MessageSquare } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Community - Production Pros Who Actually Help | GHXSTSHIP',
  description: 'Join 40K+ production professionals who share real advice, not just humble brags. Get help from people who\'ve been there.',
  openGraph: {
    title: 'Community - Production Pros Who Actually Help | GHXSTSHIP',
    description: 'Join 40K+ production professionals who share real advice, not just humble brags.',
    url: 'https://ghxstship.com/community',
  },
};

const communityChannels = [
  {
    name: 'Discord Server',
    description: 'Real-time chat with production pros who actually answer questions',
    members: '15,247',
    activity: 'Very Active',
    icon: MessageSquare,
    href: 'https://discord.gg/ghxstship',
    gradient: 'from-primary to-accent',
    features: ['Real-time chat', 'Voice channels', 'Screen sharing', 'Industry channels'],
  },
  {
    name: 'Skool Community',
    description: 'Learn from people who\'ve managed real productions (not just theory)',
    members: '8,932',
    activity: 'Active',
    icon: Users,
    href: 'https://skool.com/ghxstship',
    gradient: 'from-primary to-accent',
    features: ['Courses & workshops', 'Networking events', 'Mentorship programs', 'Resource library'],
  },
  {
    name: 'Forums',
    description: 'Deep dives into production problems and solutions that actually work',
    members: '12,456',
    activity: 'Active',
    icon: MessageCircle,
    href: '/community/forums',
    gradient: 'from-primary to-accent',
    features: ['Technical discussions', 'Project showcases', 'Q&A sessions', 'Industry insights'],
  },
  {
    name: 'Events & Meetups',
    description: 'Network with people who won\'t just pitch you their services',
    members: '5,678',
    activity: 'Weekly',
    icon: Calendar,
    href: '/community/events',
    gradient: 'from-primary to-accent',
    features: ['Monthly meetups', 'Workshops', 'Conferences', 'Networking sessions'],
  },
];

const socialChannels = [
  {
    name: 'Twitter',
    handle: '@ghxstship',
    followers: '25K',
    icon: Twitter,
    href: 'https://twitter.com/ghxstship',
    description: 'Hot takes and production tips that don\'t suck',
  },
  {
    name: 'LinkedIn',
    handle: 'GHXSTSHIP',
    followers: '18K',
    icon: Github,
    href: 'https://linkedin.com/company/ghxstship',
    description: 'Professional content without the corporate fluff',
  },
  {
    name: 'YouTube',
    handle: '@ghxstship',
    followers: '12K',
    icon: Youtube,
    href: 'https://youtube.com/@ghxstship',
    description: 'Tutorials from real productions, not stock footage demos',
  },
  {
    name: 'GitHub',
    handle: 'ghxstship',
    followers: '8K',
    icon: Github,
    href: 'https://github.com/ghxstship',
    description: 'Code that actually works in production environments',
  },
  {
    name: 'Instagram',
    handle: '@ghxstship',
    followers: '10K',
    icon: Instagram,
    href: 'https://instagram.com/ghxstship',
    description: 'Behind-the-scenes content that isn\'t just humble brags',
  },
  {
    name: 'Twitch',
    handle: '@ghxstship',
    followers: '5K',
    icon: Twitch,
    href: 'https://twitch.tv/ghxstship',
    description: 'Live streams where we actually build stuff (not just talk about it)',
  },
];

const testimonials = [
  {
    quote: "The GHXSTSHIP community has been invaluable for my career growth. The connections I've made and knowledge I've gained are incredible.",
    author: "Sarah Chen",
    role: "VP of Production, Meridian Studios",
    avatar: "SC",
  },
  {
    quote: "Being part of this community has opened doors I never knew existed. The mentorship and collaboration opportunities are amazing.",
    author: "Marcus Rodriguez",
    role: "Creative Director, Apex Advertising",
    avatar: "MR",
  },
  {
    quote: "The Discord server is my go-to place for quick answers and industry insights. The community is incredibly supportive and knowledgeable.",
    author: "Emily Watson",
    role: "Head of Operations, Harmony Events",
    avatar: "EW",
  },
];

const upcomingEvents = [
  {
    title: 'Production Management Masterclass',
    date: 'Dec 15, 2024',
    time: '2:00 PM EST',
    type: 'Workshop',
    attendees: 247,
    description: 'Learn advanced production management techniques from industry experts.',
  },
  {
    title: 'Creative Networking Mixer',
    date: 'Dec 20, 2024',
    time: '6:00 PM EST',
    type: 'Networking',
    attendees: 156,
    description: 'Connect with creative professionals from around the world.',
  },
  {
    title: 'ATLVS Feature Deep Dive',
    date: 'Jan 8, 2025',
    time: '1:00 PM EST',
    type: 'Product Demo',
    attendees: 89,
    description: 'Explore the latest ATLVS features and best practices.',
  },
];

const achievements = [
  {
    title: 'Community Champion',
    description: 'Awarded to active community members who help others',
    icon: Trophy,
    metric: '100+',
    recipients: 156,
  },
  {
    title: 'Knowledge Sharer',
    description: 'For members who contribute valuable insights and resources',
    icon: Users,
    metric: '500+',
    recipients: 89,
  },
  {
    title: 'Event Organizer',
    description: 'Recognizing those who organize community events',
    icon: Calendar,
    metric: '20+',
    recipients: 23,
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Community
            </Badge>
            <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
              JOIN THE
              <br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                GHXSTSHIP COMMUNITY
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
              Connect with 25,000+ creative professionals, share knowledge, and grow your career 
              in the world's most vibrant creative community.
            </p>

            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <a href="https://discord.gg/ghxstship" target="_blank" rel="noopener noreferrer">
                <Button className="w-full sm:w-auto group">
                  Join Discord Community
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="/auth/signup">
                <Button variant="outline" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </a>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-xl text-center">
            <div>
              <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>50K+</div>
              <div className="text-body-sm color-muted">Community Members</div>
            </div>
            <div>
              <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>200+</div>
              <div className="text-body-sm color-muted">Countries</div>
            </div>
            <div>
              <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>24/7</div>
              <div className="text-body-sm color-muted">Support Available</div>
            </div>
            <div>
              <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>98%</div>
              <div className="text-body-sm color-muted">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              CONNECT WITH CREATORS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Choose how you want to engage with the community. Each platform offers 
              unique opportunities for learning, networking, and collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl mb-3xl">
            {communityChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Card key={channel.name} className="group hover:shadow-floating transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md mb-lg">
                      <div className={`p-sm rounded-lg bg-gradient-to-r ${channel.gradient}`}>
                        <Icon className="h-6 w-6 text-background" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-sm mb-sm">
                          <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-sm uppercase`}>{channel.name}</h3>
                          <Badge variant="secondary" className="text-body-sm">
                            {channel.activity}
                          </Badge>
                        </div>
                        <p className="color-muted mb-sm">{channel.description}</p>
                        <div className="text-body-sm color-muted">
                          <span className="text-heading-4 color-foreground">{channel.members}</span> members
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-sm mb-lg">
                      {channel.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-sm">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${channel.gradient}`}></div>
                          <span className="text-body-sm color-muted">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {channel.href.startsWith('http') ? (
                      <a href={channel.href as any} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full group transition-all duration-200 hover:scale-105">
                          Join Community
                          <ExternalLink className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </a>
                    ) : (
                      <a href={channel.href as any}>
                        <Button className="w-full group transition-all duration-200 hover:scale-105">
                          Join Community
                          <ExternalLink className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              FOLLOW US EVERYWHERE
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Stay updated with the latest news, insights, and community highlights 
              across all our social media channels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {socialChannels.map((social) => {
              const Icon = social.icon;
              return (
                <Card key={social.name} className="text-center hover:shadow-floating transition-shadow">
                  <CardContent className="p-lg">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-md">
                      <Icon className="h-6 w-6 text-foreground" />
                    </div>
                    <h3 className="text-heading-4 color-foreground mb-sm">{social.name}</h3>
                    <p className="text-body-sm color-muted mb-sm">{social.handle}</p>
                    <div className="text-body-sm text-heading-4 text-foreground mb-md">
                      {social.followers} followers
                    </div>
                    <p className="text-body-sm color-muted mb-md">{social.description}</p>
                    <a href={social.href as any} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full group transition-all duration-200 hover:scale-105">
                        Follow
                        <ExternalLink className="ml-sm h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              UPCOMING EVENTS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Join our regular events to learn, network, and stay ahead of industry trends.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-xl mb-2xl">
            {upcomingEvents.map((event) => (
              <Card key={event.title} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg">
                  <Badge variant="outline" className="mb-md">
                    {event.type}
                  </Badge>
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-sm uppercase`}>{event.title}</h3>
                  <p className="text-body-sm color-muted mb-md">{event.description}</p>
                  
                  <div className="stack-sm mb-lg">
                    <div className="flex items-center gap-sm text-body-sm">
                      <Calendar className="h-4 w-4 text-foreground" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-sm text-body-sm">
                      <Users className="h-4 w-4 text-foreground" />
                      <span>{event.attendees} registered</span>
                    </div>
                  </div>

                  <Button className="w-full transition-all duration-200 hover:scale-105">
                    Register Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <a href="/community/events">
              <Button className="group transition-all duration-200 hover:scale-105">
                View All Events
                <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              COMMUNITY VOICES
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-xl">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-xl">
                  <blockquote className="text-body color-foreground mb-lg leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-background text-heading-4 text-body-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="text-heading-4 color-foreground">{testimonial.author}</div>
                      <div className="text-body-sm color-muted">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Achievements */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              COMMUNITY ACHIEVEMENTS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Recognize and celebrate the contributions of our amazing community members.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-xl">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Card key={achievement.title} className="text-center hover:shadow-floating transition-shadow">
                  <CardContent className="p-xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-lg">
                      <Icon className="h-8 w-8 text-foreground" />
                    </div>
                    <div className={`${anton.className} text-heading-3 text-heading-3 text-foreground mb-sm uppercase`}>{achievement.metric}</div>
                    <p className="color-muted mb-lg">{achievement.description}</p>
                    <div className="text-body-sm color-muted">
                      <span className="text-heading-4 text-foreground">{achievement.recipients}</span> recipients
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4xl bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              READY TO JOIN THE COMMUNITY?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Connect with 25,000+ creative professionals and take your career to the next level.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <a href="https://discord.gg/ghxstship" target="_blank" rel="noopener noreferrer">
                <Button className="w-full sm:w-auto group">
                  Join Discord Community
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="/auth/signup">
                <Button variant="outline" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
