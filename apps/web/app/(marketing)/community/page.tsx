import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, MessageCircle, Users, Calendar, Trophy, ExternalLink, Github, Twitter, Youtube, Instagram, Twitch, MessageSquare } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Community - Connect with Creative Professionals | GHXSTSHIP',
  description: 'Join the GHXSTSHIP community of creative professionals. Connect, learn, and grow with thousands of industry experts.',
  openGraph: {
    title: 'Community - Connect with Creative Professionals | GHXSTSHIP',
    description: 'Join the GHXSTSHIP community of creative professionals. Connect, learn, and grow with thousands of industry experts.',
    url: 'https://ghxstship.com/community',
  },
};

const communityChannels = [
  {
    name: 'Discord Server',
    description: 'Real-time chat with 15K+ creative professionals',
    members: '15,247',
    activity: 'Very Active',
    icon: MessageSquare,
    href: 'https://discord.gg/ghxstship',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['Real-time chat', 'Voice channels', 'Screen sharing', 'Industry channels'],
  },
  {
    name: 'Skool Community',
    description: 'Structured learning and networking platform',
    members: '8,932',
    activity: 'Active',
    icon: Users,
    href: 'https://skool.com/ghxstship',
    gradient: 'from-green-500 to-teal-500',
    features: ['Courses & workshops', 'Networking events', 'Mentorship programs', 'Resource library'],
  },
  {
    name: 'Forums',
    description: 'In-depth discussions and knowledge sharing',
    members: '12,456',
    activity: 'Active',
    icon: MessageCircle,
    href: '/community/forums',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Technical discussions', 'Project showcases', 'Q&A sessions', 'Industry insights'],
  },
  {
    name: 'Events & Meetups',
    description: 'Virtual and in-person networking events',
    members: '5,678',
    activity: 'Weekly',
    icon: Calendar,
    href: '/community/events',
    gradient: 'from-orange-500 to-red-500',
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
    description: 'Latest updates and industry news',
  },
  {
    name: 'LinkedIn',
    handle: 'GHXSTSHIP',
    followers: '18K',
    icon: Github,
    href: 'https://linkedin.com/company/ghxstship',
    description: 'Professional insights and company updates',
  },
  {
    name: 'YouTube',
    handle: '@ghxstship',
    followers: '12K',
    icon: Youtube,
    href: 'https://youtube.com/@ghxstship',
    description: 'Tutorials, webinars, and case studies',
  },
  {
    name: 'GitHub',
    handle: 'ghxstship',
    followers: '8K',
    icon: Github,
    href: 'https://github.com/ghxstship',
    description: 'Open source projects and integrations',
  },
  {
    name: 'Instagram',
    handle: '@ghxstship',
    followers: '10K',
    icon: Instagram,
    href: 'https://instagram.com/ghxstship',
    description: 'Behind-the-scenes and community spotlights',
  },
  {
    name: 'Twitch',
    handle: '@ghxstship',
    followers: '5K',
    icon: Twitch,
    href: 'https://twitch.tv/ghxstship',
    description: 'Live streams and community events',
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
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Community
            </Badge>
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              JOIN THE
              <br />
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                GHXSTSHIP COMMUNITY
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Connect with 25,000+ creative professionals, share knowledge, and grow your career 
              in the world's most vibrant creative community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://discord.gg/ghxstship" target="_blank" rel="noopener noreferrer">
                <Button className="w-full sm:w-auto group">
                  Join Discord Community
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="/auth/signup">
                <Button className="w-full sm:w-auto">
                  Create Account
                </Button>
              </a>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>50K+</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
            <div>
              <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>200+</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
            <div>
              <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>24/7</div>
              <div className="text-sm text-muted-foreground">Support Available</div>
            </div>
            <div>
              <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              CONNECT WITH CREATORS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Choose how you want to engage with the community. Each platform offers 
              unique opportunities for learning, networking, and collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {communityChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Card key={channel.name} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${channel.gradient}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`${anton.className} text-xl font-bold mb-2 uppercase`}>{channel.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {channel.activity}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{channel.description}</p>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{channel.members}</span> members
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {channel.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${channel.gradient}`}></div>
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {channel.href.startsWith('http') ? (
                      <a href={channel.href as any} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full group">
                          Join Community
                          <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </a>
                    ) : (
                      <a href={channel.href as any}>
                        <Button className="w-full group">
                          Join Community
                          <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              FOLLOW US EVERYWHERE
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Stay updated with the latest news, insights, and community highlights 
              across all our social media channels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialChannels.map((social) => {
              const Icon = social.icon;
              return (
                <Card key={social.name} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{social.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{social.handle}</p>
                    <div className="text-sm font-semibold text-primary mb-4">
                      {social.followers} followers
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">{social.description}</p>
                    <a href={social.href as any} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full">
                        Follow
                        <ExternalLink className="ml-2 h-3 w-3" />
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              UPCOMING EVENTS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Join our regular events to learn, network, and stay ahead of industry trends.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {upcomingEvents.map((event) => (
              <Card key={event.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-4">
                    {event.type}
                  </Badge>
                  <h3 className={`${anton.className} text-xl font-bold mb-2 uppercase`}>{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{event.attendees} registered</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    Register Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <a href="/community/events">
              <Button>
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              COMMUNITY VOICES
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <blockquote className="text-lg text-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Achievements */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              COMMUNITY ACHIEVEMENTS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Recognize and celebrate the contributions of our amazing community members.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Card key={achievement.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className={`${anton.className} text-2xl font-bold text-primary mb-2 uppercase`}>{achievement.metric}</div>
                    <p className="text-muted-foreground mb-6">{achievement.description}</p>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">{achievement.recipients}</span> recipients
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO JOIN THE COMMUNITY?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with 25,000+ creative professionals and take your career to the next level.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://discord.gg/ghxstship" target="_blank" rel="noopener noreferrer">
                <Button className="w-full sm:w-auto group">
                  Join Discord Community
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="/auth/signup">
                <Button className="w-full sm:w-auto">
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
