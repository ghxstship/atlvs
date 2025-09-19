import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Mail, Phone, MapPin, Clock, MessageSquare, Users, Zap, Globe } from 'lucide-react';
import { anton } from '../../_components/lib/typography';

export const metadata: Metadata = {
  title: 'Contact Us - We Actually Respond | GHXSTSHIP',
  description: 'Reach the production management team that survived Formula 1 chaos. We answer emails, solve problems, and don\'t ghost you.',
  openGraph: {
    title: 'Contact Us - We Actually Respond | GHXSTSHIP',
    description: 'Reach the production management team that actually responds to emails.',
    url: 'https://ghxstship.com/contact',
  },
};

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help from people who actually know the product',
    contact: 'support@ghxstship.com',
    response: 'Response within 24 hours',
    color: 'from-primary to-accent',
  },
  {
    icon: MessageSquare,
    title: 'Sales Inquiries',
    description: 'Talk to sales people who won\'t waste your time',
    contact: 'sales@ghxstship.com',
    response: 'Response within 4 hours',
    color: 'from-primary to-accent',
  },
  {
    icon: Users,
    title: 'Partnerships',
    description: 'Partner with people who actually deliver',
    contact: 'partnerships@ghxstship.com',
    response: 'Response within 48 hours',
    color: 'from-primary to-accent',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Talk to humans, not phone trees',
    contact: '+1 (555) 123-4567',
    response: 'Mon-Fri, 9AM-6PM PST',
    color: 'from-primary to-accent',
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
      <section className="py-4xl bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <Badge variant="outline" className="mb-md">
              Contact Us
            </Badge>
            <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
              NEED HELP?
              <br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                WE ACTUALLY RESPOND
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto">
              Questions about production management that doesn't suck? Need support from people who've 
              actually managed real productions? We're here and we don't ghost you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              MULTIPLE WAYS TO REACH US
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Pick your preferred way to reach humans who actually know what they're talking about.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {contactMethods.map((method: any) => {
              const Icon = method.icon;
              return (
                <Card key={method.title} className="hover:shadow-floating transition-shadow">
                  <CardContent className="p-lg text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${method.color} mb-md`}>
                      <Icon className="h-6 w-6 text-background" />
                    </div>
                    <h3 className={`${anton.className} text-body text-heading-3 mb-sm uppercase`}>{method.title}</h3>
                    <p className="text-body-sm color-muted mb-md">{method.description}</p>
                    <div className="stack-sm">
                      <p className="text-heading-4 color-foreground">{method.contact}</p>
                      <p className="text-body-sm color-muted">{method.response}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-3xl">
              <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
                SEND US A MESSAGE
              </h2>
              <p className="text-body color-muted">
                Tell us what's going on and we'll actually get back to you (no auto-responders).
              </p>
            </div>

            <Card>
              <CardContent className="p-xl">
                <form className="stack-lg">
                  <div className="grid md:grid-cols-2 gap-lg">
                    <div>
                      <label htmlFor="firstName" className="block text-body-sm form-label color-foreground mb-sm">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full  px-md py-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-body-sm form-label color-foreground mb-sm">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full  px-md py-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-lg">
                    <div>
                      <label htmlFor="email" className="block text-body-sm form-label color-foreground mb-sm">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full  px-md py-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-body-sm form-label color-foreground mb-sm">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        className="w-full  px-md py-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-body-sm form-label color-foreground mb-sm">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full  px-md py-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <label htmlFor="message" className="block text-body-sm form-label color-foreground mb-sm">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      placeholder="Tell us more about your inquiry..."
                      className="w-full  px-md py-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-sm">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      className="h-4 w-4 text-foreground focus:ring-primary border-input rounded"
                    />
                    <label htmlFor="newsletter" className="text-body-sm color-muted">
                      I'd like to receive updates about GHXSTSHIP products and features
                    </label>
                  </div>

                  <Button className="w-full group">
                    Send Message
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              OUR OFFICES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Find us in the real world, where we're probably managing some kind of organized chaos.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-xl">
            {offices.map((office: any) => (
              <Card key={office.city} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-xl">
                  <div className="flex items-center gap-sm mb-lg">
                    <MapPin className="h-6 w-6 text-foreground" />
                    <div>
                      <h3 className={`${anton.className} text-heading-4 text-heading-3 uppercase`}>{office.city}</h3>
                      {office.isHeadquarters && (
                        <Badge variant="outline" className="mt-xs">Headquarters</Badge>
                      )}
                    </div>
                  </div>

                  <div className="stack-md">
                    <div>
                      <h4 className="text-heading-4 text-body-sm color-muted mb-sm uppercase">ADDRESS</h4>
                      <p className="text-body-sm color-foreground">{office.address}</p>
                      <p className="text-body-sm color-foreground">{office.zipcode}</p>
                    </div>

                    <div>
                      <h4 className="text-heading-4 text-body-sm color-muted mb-sm uppercase">CONTACT</h4>
                      <p className="text-body-sm color-foreground">{office.phone}</p>
                      <p className="text-body-sm color-foreground">{office.email}</p>
                    </div>

                    <div>
                      <h4 className="text-heading-4 text-body-sm color-muted mb-sm uppercase">TIMEZONE</h4>
                      <p className="text-body-sm color-foreground">{office.timezone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Answers to questions we get asked a lot. If yours isn't here, just ask us directly.
            </p>
          </div>

          <div className="max-w-4xl mx-auto stack-lg">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-lg">
                  <h3 className="text-heading-4 color-foreground mb-sm">{faq.question}</h3>
                  <p className="color-muted">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-2xl">
            <p className="color-muted mb-md">Still have questions?</p>
            <Link href="/resources">
              <Button>
                Visit Help Center
                <ArrowRight className="ml-sm h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4xl bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              READY TO GET STARTED?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Don't wait - start your free trial today and see why thousands of creative teams choose GHXSTSHIP.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="w-full sm:w-auto">
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
