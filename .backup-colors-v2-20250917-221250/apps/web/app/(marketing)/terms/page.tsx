import type { Metadata } from 'next';
import { Card, CardContent, Badge } from '@ghxstship/ui';
import { Scale, FileText, Shield, AlertTriangle, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | GHXSTSHIP',
  description: 'Read our terms of service and understand your rights and responsibilities when using GHXSTSHIP.',
  openGraph: {
    title: 'Terms of Service | GHXSTSHIP',
    description: 'Read our terms of service and understand your rights and responsibilities when using GHXSTSHIP.',
    url: 'https://ghxstship.com/terms',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen py-4xl">
      <div className="container mx-auto px-md max-w-4xl">
        {/* Header */}
        <div className="text-center mb-3xl">
          <Badge variant="outline" className="mb-md">
            Legal
          </Badge>
          <h1 className="font-title text-heading-1 lg:text-display text-heading-3 mb-lg">
            TERMS OF SERVICE
          </h1>
          <p className="text-body color-muted mb-md">
            These terms govern your use of GHXSTSHIP's services and platform.
          </p>
          <p className="text-body-sm color-muted">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Quick Summary */}
        <Card className="mb-2xl bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-xl">
            <div className="flex items-center gap-sm mb-lg">
              <Scale className="h-8 w-8 color-primary" />
              <h2 className="font-title text-heading-3 text-heading-3">Terms Summary</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-lg">
              <div className="flex items-start gap-sm">
                <FileText className="h-5 w-5 color-primary mt-xs" />
                <div>
                  <h3 className="text-heading-4 mb-sm">Your Agreement</h3>
                  <p className="text-body-sm color-muted">By using our services, you agree to these terms and our privacy policy.</p>
                </div>
              </div>
              <div className="flex items-start gap-sm">
                <Shield className="h-5 w-5 color-primary mt-xs" />
                <div>
                  <h3 className="text-heading-4 mb-sm">Your Responsibilities</h3>
                  <p className="text-body-sm color-muted">Use our platform lawfully and respect other users' rights.</p>
                </div>
              </div>
              <div className="flex items-start gap-sm">
                <AlertTriangle className="h-5 w-5 color-primary mt-xs" />
                <div>
                  <h3 className="text-heading-4 mb-sm">Important Limits</h3>
                  <p className="text-body-sm color-muted">Our liability is limited and disputes are resolved through arbitration.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-2xl">
          {/* Acceptance of Terms */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">1. Acceptance of Terms</h2>
            <p className="color-muted mb-md">
              By accessing or using GHXSTSHIP's services, you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you disagree with any part of these terms, you may not access our services.
            </p>
            <p className="color-muted">
              These Terms apply to all visitors, users, and others who access or use our service, including our website, mobile applications, and API.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">2. Description of Service</h2>
            <p className="color-muted mb-md">
              GHXSTSHIP provides cloud-based production management software including:
            </p>
            <ul className="list-disc list-inside stack-sm color-muted ml-md mb-md">
              <li>ATLVS - Production management and workflow tools</li>
              <li>OPENDECK - Creative asset management platform</li>
              <li>Related APIs, integrations, and support services</li>
            </ul>
            <p className="color-muted">
              We reserve the right to modify, suspend, or discontinue any part of our service at any time with reasonable notice.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">3. User Accounts</h2>
            
            <div className="stack-lg">
              <div>
                <h3 className="text-heading-4 text-body mb-sm">Account Registration</h3>
                <p className="color-muted mb-sm">
                  To use our services, you must:
                </p>
                <ul className="list-disc list-inside stack-sm color-muted ml-md">
                  <li>Provide accurate and complete information</li>
                  <li>Be at least 18 years old or have parental consent</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </div>

              <div>
                <h3 className="text-heading-4 text-body mb-sm">Account Responsibility</h3>
                <p className="color-muted">
                  You are responsible for all activities that occur under your account. You agree to use strong passwords and enable two-factor authentication when available.
                </p>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">4. Acceptable Use Policy</h2>
            
            <Card className="bg-destructive/10 border-destructive/20 mb-lg">
              <CardContent className="p-lg">
                <div className="flex items-start gap-sm">
                  <AlertTriangle className="h-6 w-6 color-destructive mt-xs" />
                  <div>
                    <h3 className="text-heading-4 color-destructive mb-sm">Prohibited Activities</h3>
                    <p className="text-body-sm color-destructive/80">
                      The following activities are strictly prohibited and may result in immediate account termination.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="stack-md">
              <div>
                <h3 className="text-heading-4 mb-sm">You may not:</h3>
                <ul className="list-disc list-inside stack-sm color-muted ml-md">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Upload malicious code or attempt to hack our systems</li>
                  <li>Spam, harass, or abuse other users</li>
                  <li>Share your account credentials with others</li>
                  <li>Use our service for illegal or unauthorized purposes</li>
                  <li>Attempt to reverse engineer our software</li>
                  <li>Exceed rate limits or abuse our API</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Content and Data */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">5. Content and Data</h2>
            
            <div className="stack-lg">
              <div>
                <h3 className="text-heading-4 text-body mb-sm">Your Content</h3>
                <p className="color-muted mb-sm">
                  You retain ownership of all content you upload to our platform. By using our service, you grant us a limited license to:
                </p>
                <ul className="list-disc list-inside stack-sm color-muted ml-md">
                  <li>Store and process your content to provide our services</li>
                  <li>Make backups for data protection and recovery</li>
                  <li>Display your content to authorized team members</li>
                  <li>Analyze usage patterns to improve our platform (anonymized)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-heading-4 text-body mb-sm">Content Standards</h3>
                <p className="color-muted">
                  All content must comply with applicable laws and our community guidelines. We reserve the right to remove content that violates these terms or is reported by other users.
                </p>
              </div>

              <div>
                <h3 className="text-heading-4 text-body mb-sm">Data Backup</h3>
                <p className="color-muted">
                  While we maintain regular backups, you are responsible for maintaining your own copies of important data. We recommend regular exports of critical information.
                </p>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">6. Payment Terms</h2>
            
            <div className="stack-lg">
              <div>
                <h3 className="text-heading-4 text-body mb-sm">Subscription Fees</h3>
                <p className="color-muted mb-sm">
                  Paid plans are billed in advance on a monthly or annual basis. Fees are non-refundable except as required by law or as specified in our refund policy.
                </p>
              </div>

              <div>
                <h3 className="text-heading-4 text-body mb-sm">Price Changes</h3>
                <p className="color-muted mb-sm">
                  We may change our pricing with 30 days' notice. Price changes will not affect your current billing cycle.
                </p>
              </div>

              <div>
                <h3 className="text-heading-4 text-body mb-sm">Late Payment</h3>
                <p className="color-muted">
                  If payment fails, we may suspend your account after reasonable notice. You remain responsible for all charges incurred before suspension.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">7. Intellectual Property</h2>
            
            <div className="stack-md">
              <div>
                <h3 className="text-heading-4 mb-sm">Our Rights</h3>
                <p className="color-muted">
                  GHXSTSHIP and its licensors own all rights to our platform, including software, designs, trademarks, and documentation. These Terms do not grant you any ownership rights.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 mb-sm">License to Use</h3>
                <p className="color-muted">
                  We grant you a limited, non-exclusive, non-transferable license to use our platform in accordance with these Terms and your subscription plan.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 mb-sm">Feedback</h3>
                <p className="color-muted">
                  Any feedback, suggestions, or ideas you provide may be used by us without compensation or attribution.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy and Security */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">8. Privacy and Security</h2>
            
            <p className="color-muted mb-md">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            
            <div className="grid md:grid-cols-2 gap-lg">
              <Card>
                <CardContent className="p-lg">
                  <h3 className="text-heading-4 mb-sm">Data Security</h3>
                  <p className="text-body-sm color-muted">
                    We implement industry-standard security measures, but cannot guarantee absolute security. You should also take precautions to protect your data.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-lg">
                  <h3 className="text-heading-4 mb-sm">Data Processing</h3>
                  <p className="text-body-sm color-muted">
                    We process your data in accordance with applicable privacy laws, including GDPR and CCPA where applicable.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">9. Disclaimers</h2>
            
            <Card className="bg-warning/10 border-warning/20">
              <CardContent className="p-lg">
                <p className="color-muted mb-md">
                  <strong>IMPORTANT:</strong> Our services are provided "as is" without warranties of any kind, either express or implied.
                </p>
                
                <div className="stack-sm text-body-sm color-muted">
                  <p>We disclaim all warranties, including but not limited to:</p>
                  <ul className="list-disc list-inside stack-xs ml-md">
                    <li>Merchantability and fitness for a particular purpose</li>
                    <li>Non-infringement of third-party rights</li>
                    <li>Uninterrupted or error-free operation</li>
                    <li>Security or accuracy of data transmission</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">10. Limitation of Liability</h2>
            
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-lg">
                <p className="color-muted mb-md">
                  <strong>LIABILITY LIMITS:</strong> To the maximum extent permitted by law, GHXSTSHIP's total liability is limited to the amount you paid us in the 12 months preceding the claim.
                </p>
                
                <div className="stack-sm text-body-sm color-muted">
                  <p>We are not liable for:</p>
                  <ul className="list-disc list-inside stack-xs ml-md">
                    <li>Indirect, incidental, or consequential damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Third-party actions or content</li>
                    <li>Service interruptions or data loss</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">11. Indemnification</h2>
            
            <p className="color-muted">
              You agree to indemnify and hold harmless GHXSTSHIP from any claims, damages, or expenses arising from your use of our services, violation of these Terms, or infringement of any rights of another party.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">12. Termination</h2>
            
            <div className="stack-md">
              <div>
                <h3 className="text-heading-4 mb-sm">By You</h3>
                <p className="color-muted">
                  You may terminate your account at any time through your account settings or by contacting us. Termination does not entitle you to a refund of prepaid fees.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 mb-sm">By Us</h3>
                <p className="color-muted">
                  We may suspend or terminate your account for violation of these Terms, non-payment, or other reasons with reasonable notice when possible.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 mb-sm">Effect of Termination</h3>
                <p className="color-muted">
                  Upon termination, your access will cease and we may delete your data after a reasonable retention period. You should export important data before termination.
                </p>
              </div>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">13. Dispute Resolution</h2>
            
            <div className="stack-md">
              <div>
                <h3 className="text-heading-4 mb-sm">Informal Resolution</h3>
                <p className="color-muted">
                  Before filing any formal dispute, please contact us at legal@ghxstship.com to attempt informal resolution.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 mb-sm">Binding Arbitration</h3>
                <p className="color-muted">
                  Any disputes will be resolved through binding arbitration rather than in court, except for small claims court matters and intellectual property disputes.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 mb-sm">Class Action Waiver</h3>
                <p className="color-muted">
                  You agree to resolve disputes individually and waive the right to participate in class actions or representative proceedings.
                </p>
              </div>
            </div>
          </section>

          {/* General Provisions */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">14. General Provisions</h2>
            
            <div className="stack-md">
              <div>
                <h3 className="text-heading-4 mb-sm">Governing Law</h3>
                <p className="color-muted">
                  These Terms are governed by the laws of California, United States, without regard to conflict of law principles.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 mb-sm">Severability</h3>
                <p className="color-muted">
                  If any provision is found unenforceable, the remaining provisions will continue in full force and effect.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 mb-sm">Entire Agreement</h3>
                <p className="color-muted">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and GHXSTSHIP.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-4 mb-sm">Changes to Terms</h3>
                <p className="color-muted">
                  We may update these Terms from time to time. Material changes will be communicated with reasonable advance notice.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="font-title text-heading-3 text-heading-3 mb-lg">15. Contact Information</h2>
            
            <Card>
              <CardContent className="p-lg">
                <div className="flex items-start gap-md">
                  <Mail className="h-6 w-6 color-primary mt-xs" />
                  <div>
                    <h3 className="text-heading-4 mb-sm">Questions About These Terms?</h3>
                    <p className="color-muted mb-md">
                      If you have questions about these Terms of Service, please contact us:
                    </p>
                    
                    <div className="stack-sm text-body-sm">
                      <p><strong>Email:</strong> legal@ghxstship.com</p>
                      <p><strong>Address:</strong> GHXSTSHIP, Inc.<br />123 Market Street, Suite 500<br />San Francisco, CA 94105</p>
                      <p><strong>Phone:</strong> +1 (555) 123-4567</p>
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
