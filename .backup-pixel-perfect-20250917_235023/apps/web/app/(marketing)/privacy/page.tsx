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
    <div className="min-h-screen py-4xl">
      <div className="container mx-auto px-md max-w-4xl">
        {/* Header */}
        <div className="text-center mb-3xl">
          <Badge variant="outline" className="mb-md">
            Legal
          </Badge>
          <h1 className="font-title text-heading-1 lg:text-display text-heading-3 mb-lg">
            PRIVACY POLICY
          </h1>
          <p className="text-body color-muted mb-md">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-body-sm color-muted">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Quick Overview */}
        <Card className="mb-2xl bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-xl">
            <div className="flex items-center gap-sm mb-lg">
              <Shield className="h-8 w-8 text-foreground" />
              <h2 className="font-title text-heading-3 text-heading-3">Privacy at a Glance</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-lg">
              <div className="flex items-start gap-sm">
                <Eye className="h-5 w-5 text-foreground mt-xs" />
                <div>
                  <h3 className="text-heading-4 mb-sm">What We Collect</h3>
                  <p className="text-body-sm color-muted">Account info, usage data, and technical information to provide our services.</p>
                </div>
              </div>
              <div className="flex items-start gap-sm">
                <Lock className="h-5 w-5 text-foreground mt-xs" />
                <div>
                  <h3 className="text-heading-4 mb-sm">How We Protect</h3>
                  <p className="text-body-sm color-muted">Enterprise-grade security, encryption, and access controls protect your data.</p>
                </div>
              </div>
              <div className="flex items-start gap-sm">
                <Users className="h-5 w-5 text-foreground mt-xs" />
                <div>
                  <h3 className="text-heading-4 mb-sm">Your Rights</h3>
                  <p className="text-body-sm color-muted">Access, correct, delete, or export your data at any time.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-2xl">
          {/* Information We Collect */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">1. Information We Collect</h2>
            
            <div className="stack-lg">
              <div>
                <h3 className="text-heading-4 text-body mb-sm">Account Information</h3>
                <p className="color-muted mb-sm">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc list-inside stack-sm color-muted ml-md">
                  <li>Name and email address</li>
                  <li>Company name and role</li>
                  <li>Profile information you choose to provide</li>
                  <li>Billing and payment information (processed securely by Stripe)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-heading-4 text-body mb-sm">Usage Data</h3>
                <p className="color-muted mb-sm">
                  To improve our services, we collect:
                </p>
                <ul className="list-disc list-inside stack-sm color-muted ml-md">
                  <li>How you use our platform and features</li>
                  <li>Projects and content you create (stored securely)</li>
                  <li>Performance and error data</li>
                  <li>Communication preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-heading-4 text-body mb-sm">Technical Information</h3>
                <p className="color-muted mb-sm">
                  For security and functionality:
                </p>
                <ul className="list-disc list-inside stack-sm color-muted ml-md">
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
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">2. How We Use Your Information</h2>
            
            <div className="stack-md">
              <div className="flex items-start gap-sm">
                <div className="w-2 h-2 bg-primary rounded-full mt-sm"></div>
                <div>
                  <h3 className="text-heading-4 mb-sm">Provide Our Services</h3>
                  <p className="color-muted">Create and manage your account, process payments, and deliver our platform features.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-sm">
                <div className="w-2 h-2 bg-primary rounded-full mt-sm"></div>
                <div>
                  <h3 className="text-heading-4 mb-sm">Improve Our Platform</h3>
                  <p className="color-muted">Analyze usage patterns, fix bugs, and develop new features based on user needs.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-sm">
                <div className="w-2 h-2 bg-primary rounded-full mt-sm"></div>
                <div>
                  <h3 className="text-heading-4 mb-sm">Communicate With You</h3>
                  <p className="color-muted">Send important updates, security alerts, and optional marketing communications.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-sm">
                <div className="w-2 h-2 bg-primary rounded-full mt-sm"></div>
                <div>
                  <h3 className="text-heading-4 mb-sm">Ensure Security</h3>
                  <p className="color-muted">Detect and prevent fraud, abuse, and security threats to protect all users.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">3. Information Sharing</h2>
            
            <Card className="bg-secondary/20">
              <CardContent className="p-lg">
                <p className="color-muted mb-md">
                  <strong>We do not sell your personal information.</strong> We only share information in these limited circumstances:
                </p>
                
                <div className="stack-md">
                  <div>
                    <h3 className="text-heading-4 mb-sm">Service Providers</h3>
                    <p className="text-body-sm color-muted">Trusted partners who help us operate our platform (hosting, payments, analytics) under strict data protection agreements.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-heading-4 mb-sm">Legal Requirements</h3>
                    <p className="text-body-sm color-muted">When required by law, court order, or to protect our rights and safety.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-heading-4 mb-sm">Business Transfers</h3>
                    <p className="text-body-sm color-muted">In the event of a merger, acquisition, or sale of assets, with proper notice to users.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">4. Data Security</h2>
            
            <div className="grid md:grid-cols-2 gap-lg">
              <Card>
                <CardContent className="p-lg">
                  <div className="flex items-center gap-sm mb-md">
                    <Lock className="h-6 w-6 text-foreground" />
                    <h3 className="text-heading-4">Encryption</h3>
                  </div>
                  <p className="text-body-sm color-muted">All data is encrypted in transit and at rest using industry-standard AES-256 encryption.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-lg">
                  <div className="flex items-center gap-sm mb-md">
                    <Shield className="h-6 w-6 text-foreground" />
                    <h3 className="text-heading-4">Access Controls</h3>
                  </div>
                  <p className="text-body-sm color-muted">Strict access controls and regular security audits protect your information.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-lg">
                  <div className="flex items-center gap-sm mb-md">
                    <Globe className="h-6 w-6 text-foreground" />
                    <h3 className="text-heading-4">Compliance</h3>
                  </div>
                  <p className="text-body-sm color-muted">SOC 2 Type II certified and GDPR/CCPA compliant data handling practices.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-lg">
                  <div className="flex items-center gap-sm mb-md">
                    <Users className="h-6 w-6 text-foreground" />
                    <h3 className="text-heading-4">Team Training</h3>
                  </div>
                  <p className="text-body-sm color-muted">Regular security training for all employees with access to user data.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">5. Your Rights and Choices</h2>
            
            <div className="stack-lg">
              <div>
                <h3 className="text-heading-4 text-body mb-sm">Data Access and Portability</h3>
                <p className="color-muted">
                  You can access and export your data at any time through your account settings or by contacting us.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 text-body mb-sm">Correction and Updates</h3>
                <p className="color-muted">
                  Update your profile information directly in your account or contact us for assistance.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 text-body mb-sm">Data Deletion</h3>
                <p className="color-muted">
                  Request deletion of your account and associated data. Some information may be retained for legal or security purposes.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 text-body mb-sm">Marketing Communications</h3>
                <p className="color-muted">
                  Opt out of marketing emails at any time using the unsubscribe link or account preferences.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">6. Cookies and Tracking</h2>
            
            <p className="color-muted mb-md">
              We use cookies and similar technologies to enhance your experience:
            </p>
            
            <div className="stack-sm">
              <div className="flex items-start gap-sm">
                <Badge variant="secondary" className="mt-xs">Essential</Badge>
                <p className="text-body-sm color-muted">Required for basic platform functionality and security.</p>
              </div>
              <div className="flex items-start gap-sm">
                <Badge variant="outline" className="mt-xs">Analytics</Badge>
                <p className="text-body-sm color-muted">Help us understand how you use our platform to improve it.</p>
              </div>
              <div className="flex items-start gap-sm">
                <Badge variant="outline" className="mt-xs">Preferences</Badge>
                <p className="text-body-sm color-muted">Remember your settings and preferences across sessions.</p>
              </div>
            </div>
            
            <p className="text-body-sm color-muted mt-md">
              You can manage cookie preferences through our cookie consent banner or browser settings.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">7. International Data Transfers</h2>
            
            <p className="color-muted mb-md">
              GHXSTSHIP operates globally. Your information may be transferred to and processed in countries other than your own, including the United States. We ensure appropriate safeguards are in place:
            </p>
            
            <ul className="list-disc list-inside stack-sm color-muted ml-md">
              <li>Standard Contractual Clauses for EU data transfers</li>
              <li>Adequacy decisions where available</li>
              <li>Binding corporate rules for internal transfers</li>
              <li>Your explicit consent where required</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">8. Children's Privacy</h2>
            
            <Card className="bg-warning/10 border-warning/30">
              <CardContent className="p-lg">
                <p className="color-muted">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">9. Changes to This Policy</h2>
            
            <p className="color-muted mb-md">
              We may update this privacy policy from time to time. We will notify you of any material changes by:
            </p>
            
            <ul className="list-disc list-inside stack-sm color-muted ml-md mb-md">
              <li>Email notification to your registered address</li>
              <li>Prominent notice on our website</li>
              <li>In-app notification when you next log in</li>
            </ul>
            
            <p className="color-muted">
              Your continued use of our services after any changes indicates your acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">10. Contact Us</h2>
            
            <Card>
              <CardContent className="p-lg">
                <div className="flex items-start gap-md">
                  <Mail className="h-6 w-6 text-foreground mt-xs" />
                  <div>
                    <h3 className="text-heading-4 mb-sm">Questions About This Policy?</h3>
                    <p className="color-muted mb-md">
                      If you have any questions about this privacy policy or our data practices, please contact us:
                    </p>
                    
                    <div className="stack-sm text-body-sm">
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
