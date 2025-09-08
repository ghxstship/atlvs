import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Mail, Phone, MapPin, Clock, MessageSquare, Users, Zap, Globe } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch | GHXSTSHIP',
  description: 'Contact GHXSTSHIP for sales inquiries, support, partnerships, or general questions. Multiple ways to reach our team.',
  openGraph: {
    title: 'Contact Us - Get in Touch | GHXSTSHIP',
    description: 'Contact GHXSTSHIP for sales inquiries, support, partnerships, or general questions. Multiple ways to reach our team.',
    url: 'https://ghxstship.com/contact',
  },
};

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help from our support team',
    contact: 'support@ghxstship.com',
    response: 'Response within 24 hours',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: MessageSquare,
    title: 'Sales Inquiries',
    description: 'Speak with our sales team',
    contact: 'sales@ghxstship.com',
    response: 'Response within 4 hours',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Users,
    title: 'Partnerships',
    description: 'Explore partnership opportunities',
    contact: 'partnerships@ghxstship.com',
    response: 'Response within 48 hours',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Call us during business hours',
    contact: '+1 (555) 123-4567',
    response: 'Mon-Fri, 9AM-6PM PST',
    color: 'from-orange-500 to-red-600',
  },
];

const offices = [
  {
    city: 'San Francisco',
    address: '123 Market Street, Suite 400',
    zipcode: 'San Francisco, CA 94105',
    phone: '+1 (555) 123-4567',
    email: 'sf@ghxstship.com',
    timezone: 'PST',
    isHeadquarters: true,
  },
  {
    city: 'New York',
    address: '456 Broadway, Floor 12',
    zipcode: 'New York, NY 10013',
    phone: '+1 (555) 987-6543',
    email: 'ny@ghxstship.com',
    timezone: 'EST',
    isHeadquarters: false,
  },
  {
    city: 'London',
    address: '789 Oxford Street',
    zipcode: 'London W1C 1DX, UK',
    phone: '+44 20 7123 4567',
    email: 'london@ghxstship.com',
    timezone: 'GMT',
    isHeadquarters: false,
  },
];

const faqs = [
  {
    question: 'How do I get started with GHXSTSHIP?',
    answer: 'You can start with a free 14-day trial of either ATLVS or OPENDECK. No credit card required. Simply sign up and explore all features.',
  },
  {
    question: 'Do you offer enterprise pricing?',
    answer: 'Yes, we offer custom enterprise pricing for teams with 50+ members. Contact our sales team for a personalized quote and demo.',
  },
  {
    question: 'Can I integrate GHXSTSHIP with my existing tools?',
    answer: 'Absolutely! We offer integrations with popular tools like Slack, Trello, Asana, and many more. Our API also allows custom integrations.',
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'We provide 24/7 email support, live chat during business hours, comprehensive documentation, and video tutorials.',
  },
  {
    question: 'Is my data secure with GHXSTSHIP?',
    answer: 'Yes, we take security seriously. We\'re SOC 2 certified, GDPR compliant, and use enterprise-grade encryption for all data.',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              Contact Us
            </Badge>
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              GET IN TOUCH
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                WE'RE HERE TO HELP
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions about our products, need support, or want to explore partnerships? 
              Our team is ready to assist you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              MULTIPLE WAYS TO REACH US
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Choose the contact method that works best for you and your timeline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Card key={method.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${method.color} mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`${anton.className} text-lg font-bold mb-2 uppercase`}>{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">{method.contact}</p>
                      <p className="text-xs text-muted-foreground">{method.response}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
                SEND US A MESSAGE
              </h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select a subject</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="billing">Billing Question</option>
                      <option value="general">General Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    />
                    <label htmlFor="newsletter" className="text-sm text-muted-foreground">
                      I'd like to receive updates about GHXSTSHIP products and features
                    </label>
                  </div>

                  <Button type="submit" size="lg" className="w-full group">
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              OUR OFFICES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Visit us at one of our global locations or reach out to your nearest office.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {offices.map((office) => (
              <Card key={office.city} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className={`${anton.className} text-xl font-bold uppercase`}>{office.city}</h3>
                      {office.isHeadquarters && (
                        <Badge variant="outline" className="mt-1">Headquarters</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">ADDRESS</h4>
                      <p className="text-sm text-foreground">{office.address}</p>
                      <p className="text-sm text-foreground">{office.zipcode}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">CONTACT</h4>
                      <p className="text-sm text-foreground">{office.phone}</p>
                      <p className="text-sm text-foreground">{office.email}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">TIMEZONE</h4>
                      <p className="text-sm text-foreground">{office.timezone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Quick answers to common questions. Can't find what you're looking for? Contact us directly.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Link href="/resources">
              <Button variant="outline" size="lg">
                Visit Help Center
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO GET STARTED?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Don't wait - start your free trial today and see why thousands of creative teams choose GHXSTSHIP.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
