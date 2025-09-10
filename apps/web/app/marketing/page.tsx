import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Zap, Shield, Globe, Users, BarChart, Sparkles, CheckCircle, Star, Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GHXSTSHIP - Revolutionary Production Management Platform',
  description: 'Transform your creative production workflow with ATLVS and OPENDECK. Enterprise-grade project management, asset organization, and team collaboration tools.',
  openGraph: {
    title: 'GHXSTSHIP - Revolutionary Production Management Platform',
    description: 'Transform your creative production workflow with ATLVS and OPENDECK. Enterprise-grade project management, asset organization, and team collaboration tools.',
    url: 'https://ghxstship.com',
  },
};

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Enterprise Production Management
            </Badge>
            
            <h1 className="font-title text-5xl lg:text-7xl font-bold mb-6">
              WELCOME TO
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GHXSTSHIP
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The complete enterprise platform for creative production management. 
              Streamline workflows, manage assets, and collaborate at scale.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/login">
                <Button className="min-w-[200px]">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products">
                <Button className="min-w-[200px]">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Suite */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Our Products
            </Badge>
            <h2 className="font-title text-3xl lg:text-5xl font-bold mb-6">
              POWERFUL TOOLS FOR
              <br />
              CREATIVE PROFESSIONALS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Two flagship products working together to revolutionize how creative teams operate.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* ATLVS Card */}
            <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-8 relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-title text-3xl font-bold mb-2">ATLVS</h3>
                    <Badge variant="outline" className="mb-4">Production Management</Badge>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  The all-in-one production operations platform. Manage projects, teams, schedules, 
                  budgets, and resources with enterprise-grade tools designed for creative professionals.
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Complete project lifecycle management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Real-time team collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Advanced budget and resource tracking</span>
                  </li>
                </ul>
                
                <Link href="/products/atlvs">
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Explore ATLVS
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* OPENDECK Card */}
            <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-8 relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-title text-3xl font-bold mb-2">OPENDECK</h3>
                    <Badge variant="outline" className="mb-4">Asset Management</Badge>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Marketplace and asset management platform. Organize creative assets, discover talent, 
                  and connect with opportunities in the global creative community.
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Intelligent asset organization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Global talent marketplace</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">Seamless collaboration tools</span>
                  </li>
                </ul>
                
                <Link href="/products/opendeck">
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Explore OPENDECK
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Platform Features
            </Badge>
            <h2 className="font-title text-3xl lg:text-5xl font-bold mb-6">
              ENTERPRISE-GRADE CAPABILITIES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Built for scale, designed for creativity. Everything you need to manage production at the highest level.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level encryption, SOC 2 compliance, and advanced access controls.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Real-time updates, comments, and seamless communication across all teams.',
                gradient: 'from-green-500 to-teal-500',
              },
              {
                icon: BarChart,
                title: 'Advanced Analytics',
                description: 'Comprehensive insights and reporting to optimize your production workflow.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: Globe,
                title: 'Global Scale',
                description: 'Multi-region support with 99.9% uptime SLA and instant scalability.',
                gradient: 'from-orange-500 to-red-500',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Optimized performance with sub-second response times globally.',
                gradient: 'from-indigo-500 to-blue-500',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Smart automation and insights powered by cutting-edge AI technology.',
                gradient: 'from-yellow-500 to-orange-500',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Trusted Worldwide
            </Badge>
            <h2 className="font-title text-3xl lg:text-5xl font-bold mb-6">
              JOIN 10,000+ CREATIVE TEAMS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From indie creators to Fortune 500 companies, teams worldwide trust GHXSTSHIP.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { label: 'Active Users', value: '50,000+' },
              { label: 'Projects Managed', value: '100,000+' },
              { label: 'Countries', value: '120+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-title text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "GHXSTSHIP transformed how we manage productions. We've cut project timelines by 40% while improving quality.",
                author: "Sarah Chen",
                role: "VP Production, Meridian Studios",
                rating: 5,
              },
              {
                quote: "The best production management platform we've ever used. ATLVS is a game-changer for our team.",
                author: "Marcus Rodriguez",
                role: "Creative Director, Apex Films",
                rating: 5,
              },
              {
                quote: "OPENDECK made finding and managing talent effortless. It's become essential to our workflow.",
                author: "Emily Watson",
                role: "Producer, Northern Light Productions",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center bg-background/95 backdrop-blur">
            <CardContent className="p-12">
              <h2 className="font-title text-3xl lg:text-5xl font-bold mb-6">
                READY TO TRANSFORM
                <br />
                YOUR PRODUCTION WORKFLOW?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of creative teams already using GHXSTSHIP to streamline their operations 
                and deliver exceptional results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button className="min-w-[200px]">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button className="min-w-[200px]">
                    View Pricing
                  </Button>
                </Link>
                <Link href="/company">
                  <Button className="min-w-[200px]">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
