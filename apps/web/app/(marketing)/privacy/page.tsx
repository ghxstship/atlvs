import type { Metadata } from 'next';
import { Card, CardContent, Badge } from '@ghxstship/ui';
import { Shield, Eye, Lock, Users, Globe, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | GHXSTSHIP',
  description: 'Learn how GHXSTSHIP collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy | GHXSTSHIP',
    description: 'Learn how GHXSTSHIP collects, uses, and protects your personal information.',
    url: 'https://ghxstship.com/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Legal
          </Badge>
          <h1 className="font-title text-4xl lg:text-5xl font-bold mb-6">
            PRIVACY POLICY
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Quick Overview */}
        <Card className="mb-12 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <h2 className="font-title text-2xl font-bold">Privacy at a Glance</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">What We Collect</h3>
                  <p className="text-sm text-muted-foreground">Account info, usage data, and technical information to provide our services.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">How We Protect</h3>
                  <p className="text-sm text-muted-foreground">Enterprise-grade security, encryption, and access controls protect your data.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Your Rights</h3>
                  <p className="text-sm text-muted-foreground">Access, correct, delete, or export your data at any time.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Information We Collect */}
          <section>
            <h2 className="font-title text-2xl font-bold mb-6">1. Information We Collect</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Account Information</h3>
                <p className="text-muted-foreground mb-3">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Name and email address</li>
                  <li>Company name and role</li>
                  <li>Profile information you choose to provide</li>
                  <li>Billing and payment information (processed securely by Stripe)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Usage Data</h3>
                <p className="text-muted-foreground mb-3">
                  To improve our services, we collect:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>How you use our platform and features</li>
                  <li>Projects and content you create (stored securely)</li>
                  <li>Performance and error data</li>
                  <li>Communication preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Technical Information</h3>
                <p className="text-muted-foreground mb-3">
                  For security and functionality:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="font-title text-2xl font-bold mb-6">2. How We Use Your Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-2">Provide Our Services</h3>
                  <p className="text-muted-foreground">Create and manage your account, process payments, and deliver our platform features.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-2">Improve Our Platform</h3>
                  <p className="text-muted-foreground">Analyze usage patterns, fix bugs, and develop new features based on user needs.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-2">Communicate With You</h3>
                  <p className="text-muted-foreground">Send important updates, security alerts, and optional marketing communications.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold mb-2">Ensure Security</h3>
                  <p className="text-muted-foreground">Detect and prevent fraud, abuse, and security threats to protect all users.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="font-title text-2xl font-bold mb-6">3. Information Sharing</h2>
            
            <Card className="bg-muted/20">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  <strong>We do not sell your personal information.</strong> We only share information in these limited circumstances:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Service Providers</h3>
                    <p className="text-sm text-muted-foreground">Trusted partners who help us operate our platform (hosting, payments, analytics) under strict data protection agreements.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Legal Requirements</h3>
                    <p className="text-sm text-muted-foreground">When required by law, court order, or to protect our rights and safety.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Business Transfers</h3>
                    <p className="text-sm text-muted-foreground">In the event of a merger, acquisition, or sale of assets, with proper notice to users.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="font-title text-2xl font-bold mb-6">4. Data Security</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">Encryption</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">All data is encrypted in transit and at rest using industry-standard AES-256 encryption.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">Access Controls</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Strict access controls and regular security audits protect your information.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">Compliance</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">SOC 2 Type II certified and GDPR/CCPA compliant data handling practices.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">Team Training</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Regular security training for all employees with access to user data.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="font-title text-2xl font-bold mb-6">5. Your Rights and Choices</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Data Access and Portability</h3>
                <p className="text-muted-foreground">
                  You can access and export your data at any time through your account settings or by contacting us.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3">Correction and Updates</h3>
                <p className="text-muted-foreground">
                  Update your profile information directly in your account or contact us for assistance.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3">Data Deletion</h3>
                <p className="text-muted-foreground">
                  Request deletion of your account and associated data. Some information may be retained for legal or security purposes.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3">Marketing Communications</h3>
                <p className="text-muted-foreground">
                  Opt out of marketing emails at any time using the unsubscribe link or account preferences.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="font-title text-2xl font-bold mb-6">6. Cookies and Tracking</h2>
            
            <p className="text-muted-foreground mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">Essential</Badge>
                <p className="text-sm text-muted-foreground">Required for basic platform functionality and security.</p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Analytics</Badge>
                <p className="text-sm text-muted-foreground">Help us understand how you use our platform to improve it.</p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">Preferences</Badge>
                <p className="text-sm text-muted-foreground">Remember your settings and preferences across sessions.</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              You can manage cookie preferences through our cookie consent banner or browser settings.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="font-title text-2xl font-bold mb-6">7. International Data Transfers</h2>
            
            <p className="text-muted-foreground mb-4">
              GHXSTSHIP operates globally. Your information may be transferred to and processed in countries other than your own, including the United States. We ensure appropriate safeguards are in place:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Standard Contractual Clauses for EU data transfers</li>
              <li>Adequacy decisions where available</li>
              <li>Binding corporate rules for internal transfers</li>
              <li>Your explicit consent where required</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="font-title text-2xl font-bold mb-6">8. Children's Privacy</h2>
            
            <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="font-title text-2xl font-bold mb-6">9. Changes to This Policy</h2>
            
            <p className="text-muted-foreground mb-4">
              We may update this privacy policy from time to time. We will notify you of any material changes by:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
              <li>Email notification to your registered address</li>
              <li>Prominent notice on our website</li>
              <li>In-app notification when you next log in</li>
            </ul>
            
            <p className="text-muted-foreground">
              Your continued use of our services after any changes indicates your acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="font-title text-2xl font-bold mb-6">10. Contact Us</h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-3">Questions About This Policy?</h3>
                    <p className="text-muted-foreground mb-4">
                      If you have any questions about this privacy policy or our data practices, please contact us:
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> privacy@ghxstship.com</p>
                      <p><strong>Address:</strong> GHXSTSHIP, Inc.<br />123 Market Street, Suite 500<br />San Francisco, CA 94105</p>
                      <p><strong>Data Protection Officer:</strong> dpo@ghxstship.com</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
