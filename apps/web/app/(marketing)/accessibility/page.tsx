import type { Metadata } from 'next';
import { Card, CardContent, Badge } from '@ghxstship/ui';
import { Eye, Ear, Hand, Brain, Heart, Mail, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Accessibility Statement | GHXSTSHIP',
  description: 'Learn about GHXSTSHIP\'s commitment to accessibility and how we ensure our platform is usable by everyone.',
  openGraph: {
    title: 'Accessibility Statement | GHXSTSHIP',
    description: 'Learn about GHXSTSHIP\'s commitment to accessibility and how we ensure our platform is usable by everyone.',
    url: 'https://ghxstship.com/accessibility',
  },
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-md max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Accessibility
          </Badge>
          <h1 className="font-title text-heading-1 lg:text-display text-heading-3 mb-6">
            ACCESSIBILITY STATEMENT
          </h1>
          <p className="text-body color-muted mb-4">
            We're committed to ensuring our platform is accessible to everyone, regardless of ability or technology.
          </p>
          <p className="text-body-sm color-muted">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Commitment Overview */}
        <Card className="mb-12 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-xl">
            <div className="flex items-center gap-sm mb-6">
              <Heart className="h-8 w-8 color-primary" />
              <h2 className="font-title text-heading-3 text-heading-3">Our Commitment</h2>
            </div>
            <p className="color-muted mb-6">
              GHXSTSHIP is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.
            </p>
            <div className="grid md:grid-cols-2 gap-lg">
              <div>
                <h3 className="text-heading-4 mb-2">WCAG 2.2 AA Compliance</h3>
                <p className="text-body-sm color-muted">We strive to meet Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards.</p>
              </div>
              <div>
                <h3 className="text-heading-4 mb-2">Ongoing Improvement</h3>
                <p className="text-body-sm color-muted">We regularly audit our platform and implement improvements based on user feedback.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Features */}
        <section className="mb-12">
          <h2 className="font-title text-heading-2 mb-8">Accessibility Features</h2>
          
          <div className="grid md:grid-cols-2 gap-lg">
            <Card>
              <CardContent className="p-lg">
                <div className="flex items-center gap-sm mb-4">
                  <Eye className="h-6 w-6 color-primary" />
                  <h3 className="text-heading-4">Visual Accessibility</h3>
                </div>
                <ul className="stack-sm text-body-sm color-muted">
                  <li>• High contrast color schemes</li>
                  <li>• Scalable text up to 200% without loss of functionality</li>
                  <li>• Clear focus indicators for keyboard navigation</li>
                  <li>• Alternative text for all meaningful images</li>
                  <li>• Color is not the only means of conveying information</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-lg">
                <div className="flex items-center gap-sm mb-4">
                  <Ear className="h-6 w-6 color-primary" />
                  <h3 className="text-heading-4">Auditory Accessibility</h3>
                </div>
                <ul className="stack-sm text-body-sm color-muted">
                  <li>• Captions for all video content</li>
                  <li>• Transcripts for audio content</li>
                  <li>• Visual indicators for audio alerts</li>
                  <li>• No auto-playing audio content</li>
                  <li>• Screen reader compatible audio descriptions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-lg">
                <div className="flex items-center gap-sm mb-4">
                  <Hand className="h-6 w-6 color-primary" />
                  <h3 className="text-heading-4">Motor Accessibility</h3>
                </div>
                <ul className="stack-sm text-body-sm color-muted">
                  <li>• Full keyboard navigation support</li>
                  <li>• Generous click targets (minimum 44px)</li>
                  <li>• No time-sensitive actions without extensions</li>
                  <li>• Drag and drop alternatives</li>
                  <li>• Voice control compatibility</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-lg">
                <div className="flex items-center gap-sm mb-4">
                  <Brain className="h-6 w-6 color-primary" />
                  <h3 className="text-heading-4">Cognitive Accessibility</h3>
                </div>
                <ul className="stack-sm text-body-sm color-muted">
                  <li>• Clear, consistent navigation</li>
                  <li>• Simple, plain language</li>
                  <li>• Error prevention and clear error messages</li>
                  <li>• Consistent page layouts and interactions</li>
                  <li>• Help and documentation readily available</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technical Standards */}
        <section className="mb-12">
          <h2 className="font-title text-heading-2 text-heading-3 mb-8">Technical Standards</h2>
          
          <div className="stack-lg">
            <Card>
              <CardContent className="p-lg">
                <h3 className="text-heading-4 text-body mb-4">Web Content Accessibility Guidelines (WCAG) 2.2</h3>
                <p className="color-muted mb-4">
                  Our platform aims to conform to WCAG 2.2 Level AA standards, which include:
                </p>
                <div className="grid md:grid-cols-3 gap-md">
                  <div>
                    <h4 className="text-heading-4 mb-2">Perceivable</h4>
                    <p className="text-body-sm color-muted">Information must be presentable in ways users can perceive.</p>
                  </div>
                  <div>
                    <h4 className="text-heading-4 mb-2">Operable</h4>
                    <p className="text-body-sm color-muted">Interface components must be operable by all users.</p>
                  </div>
                  <div>
                    <h4 className="text-heading-4 mb-2">Understandable</h4>
                    <p className="text-body-sm color-muted">Information and UI operation must be understandable.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-lg">
                <h3 className="text-heading-4 text-body mb-4">Assistive Technology Support</h3>
                <p className="color-muted mb-4">
                  Our platform is tested with and supports:
                </p>
                <div className="grid md:grid-cols-2 gap-md">
                  <ul className="stack-sm text-body-sm color-muted">
                    <li>• JAWS (Windows)</li>
                    <li>• NVDA (Windows)</li>
                    <li>• VoiceOver (macOS/iOS)</li>
                    <li>• TalkBack (Android)</li>
                  </ul>
                  <ul className="stack-sm text-body-sm color-muted">
                    <li>• Dragon NaturallySpeaking</li>
                    <li>• Switch navigation devices</li>
                    <li>• High contrast displays</li>
                    <li>• Screen magnification software</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Browser Compatibility */}
        <section className="mb-12">
          <h2 className="font-title text-heading-2 text-heading-3 mb-8">Browser & Device Compatibility</h2>
          
          <Card>
            <CardContent className="p-lg">
              <div className="grid md:grid-cols-2 gap-lg">
                <div>
                  <h3 className="text-heading-4 mb-4">Supported Browsers</h3>
                  <ul className="stack-sm text-body-sm color-muted">
                    <li>• Chrome 90+ (Windows, macOS, Linux)</li>
                    <li>• Firefox 88+ (Windows, macOS, Linux)</li>
                    <li>• Safari 14+ (macOS, iOS)</li>
                    <li>• Edge 90+ (Windows, macOS)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-heading-4 mb-4">Mobile Devices</h3>
                  <ul className="stack-sm text-body-sm color-muted">
                    <li>• iOS 14+ (Safari, Chrome)</li>
                    <li>• Android 8+ (Chrome, Firefox)</li>
                    <li>• Responsive design for all screen sizes</li>
                    <li>• Touch-friendly interface elements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Known Issues */}
        <section className="mb-12">
          <h2 className="font-title text-heading-2 text-heading-3 mb-8">Known Issues & Limitations</h2>
          
          <Card className="bg-warning/10 border-warning/30">
            <CardContent className="p-lg">
              <p className="color-muted mb-4">
                We're actively working to address the following known accessibility issues:
              </p>
              <ul className="stack-sm text-body-sm color-muted">
                <li>• Some complex data visualizations may have limited screen reader support</li>
                <li>• Certain third-party integrations may not meet full WCAG standards</li>
                <li>• File upload drag-and-drop areas require keyboard alternatives (available via context menu)</li>
                <li>• Some dynamic content updates may not be immediately announced to screen readers</li>
              </ul>
              <p className="text-body-sm color-muted mt-4">
                <strong>Timeline:</strong> We aim to address these issues in our next major release (Q2 2025).
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Testing & Validation */}
        <section className="mb-12">
          <h2 className="font-title text-heading-2 text-heading-3 mb-8">Testing & Validation</h2>
          
          <div className="grid md:grid-cols-2 gap-lg">
            <Card>
              <CardContent className="p-lg">
                <h3 className="text-heading-4 mb-4">Automated Testing</h3>
                <ul className="stack-sm text-body-sm color-muted">
                  <li>• axe-core accessibility engine</li>
                  <li>• WAVE Web Accessibility Evaluation Tool</li>
                  <li>• Lighthouse accessibility audits</li>
                  <li>• Pa11y command line testing</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-lg">
                <h3 className="text-heading-4 mb-4">Manual Testing</h3>
                <ul className="stack-sm text-body-sm color-muted">
                  <li>• Screen reader navigation testing</li>
                  <li>• Keyboard-only navigation testing</li>
                  <li>• High contrast mode validation</li>
                  <li>• User testing with disability community</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feedback & Support */}
        <section className="mb-12">
          <h2 className="font-title text-heading-2 text-heading-3 mb-8">Feedback & Support</h2>
          
          <Card>
            <CardContent className="p-lg">
              <div className="flex items-start gap-md">
                <Mail className="h-6 w-6 color-primary mt-1" />
                <div>
                  <h3 className="text-heading-4 mb-3">We Want to Hear From You</h3>
                  <p className="color-muted mb-4">
                    Your feedback helps us improve accessibility for everyone. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
                  </p>
                  
                  <div className="stack-sm">
                    <div>
                      <h4 className="text-heading-4 mb-2">Accessibility Team</h4>
                      <div className="stack-xs text-body-sm">
                        <p><strong>Email:</strong> accessibility@ghxstship.com</p>
                        <p><strong>Phone:</strong> +1 (555) 123-4567 (TTY available)</p>
                        <p><strong>Response Time:</strong> We aim to respond within 2 business days</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-heading-4 mb-2">Alternative Formats</h4>
                      <p className="text-body-sm color-muted">
                        We can provide information in alternative formats such as large print, audio, or electronic formats upon request.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Accessibility Resources */}
        <section className="mb-12">
          <h2 className="font-title text-heading-2 text-heading-3 mb-8">Accessibility Resources</h2>
          
          <div className="grid md:grid-cols-2 gap-lg">
            <Card>
              <CardContent className="p-lg">
                <h3 className="text-heading-4 mb-4">Getting Started</h3>
                <ul className="stack-sm">
                  <li className="flex items-center gap-sm">
                    <ExternalLink className="h-4 w-4 color-primary" />
                    <a href="/help/accessibility-guide" className="color-primary hover:underline">
                      Accessibility User Guide
                    </a>
                  </li>
                  <li className="flex items-center gap-sm">
                    <ExternalLink className="h-4 w-4 color-primary" />
                    <a href="/help/keyboard-shortcuts" className="color-primary hover:underline">
                      Keyboard Shortcuts Reference
                    </a>
                  </li>
                  <li className="flex items-center gap-sm">
                    <ExternalLink className="h-4 w-4 color-primary" />
                    <a href="/help/screen-reader-guide" className="color-primary hover:underline">
                      Screen Reader Setup Guide
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-lg">
                <h3 className="text-heading-4 mb-4">External Resources</h3>
                <ul className="stack-sm">
                  <li className="flex items-center gap-sm">
                    <ExternalLink className="h-4 w-4 color-primary" />
                    <a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer" className="color-primary hover:underline">
                      W3C Web Accessibility Initiative
                    </a>
                  </li>
                  <li className="flex items-center gap-sm">
                    <ExternalLink className="h-4 w-4 color-primary" />
                    <a href="https://webaim.org/" target="_blank" rel="noopener noreferrer" className="color-primary hover:underline">
                      WebAIM Accessibility Resources
                    </a>
                  </li>
                  <li className="flex items-center gap-sm">
                    <ExternalLink className="h-4 w-4 color-primary" />
                    <a href="https://www.ada.gov/" target="_blank" rel="noopener noreferrer" className="color-primary hover:underline">
                      ADA.gov Information
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Legal Compliance */}
        <section>
          <h2 className="font-title text-heading-2 text-heading-3 mb-8">Legal Compliance</h2>
          
          <Card>
            <CardContent className="p-lg">
              <p className="color-muted mb-4">
                GHXSTSHIP is committed to compliance with applicable accessibility laws and regulations, including:
              </p>
              
              <div className="grid md:grid-cols-2 gap-lg">
                <div>
                  <h3 className="text-heading-4 mb-3">United States</h3>
                  <ul className="stack-sm text-body-sm color-muted">
                    <li>• Americans with Disabilities Act (ADA)</li>
                    <li>• Section 508 of the Rehabilitation Act</li>
                    <li>• 21st Century Communications and Video Accessibility Act</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-heading-4 mb-3">International</h3>
                  <ul className="stack-sm text-body-sm color-muted">
                    <li>• European Accessibility Act (EAA)</li>
                    <li>• EN 301 549 European Standard</li>
                    <li>• Accessibility for Ontarians with Disabilities Act (AODA)</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-body-sm color-muted mt-6">
                This accessibility statement was last reviewed and updated on December 15, 2024. We review and update this statement regularly to ensure it remains current and accurate.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
