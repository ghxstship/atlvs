import { Metadata } from 'next';
import { anton } from '../../_components/lib/typography';
import { Shield, Lock, Eye, Server, Users, FileCheck } from 'lucide-react';


export const metadata: Metadata = {
  title: 'Security | GHXSTSHIP',
  description: 'Learn about GHXSTSHIP\'s comprehensive security measures and data protection practices.',
};

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'SOC 2 Type II compliant infrastructure with 24/7 monitoring and threat detection.',
    },
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'End-to-end encryption for data in transit and at rest using AES-256 encryption.',
    },
    {
      icon: Eye,
      title: 'Access Controls',
      description: 'Role-based access control (RBAC) with multi-factor authentication (MFA) support.',
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Cloud-native architecture with automated security updates and vulnerability scanning.',
    },
    {
      icon: Users,
      title: 'Privacy by Design',
      description: 'GDPR and CCPA compliant data handling with user consent management.',
    },
    {
      icon: FileCheck,
      title: 'Audit Logging',
      description: 'Comprehensive audit trails for all user actions and system events.',
    },
  ];

  return (
    <div className="container mx-auto px-md py-3xl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-3xl">
          <h1 className={`${anton.className} uppercase text-heading-1 md:text-display text-heading-3 mb-lg`}>
            SECURITY & TRUST
          </h1>
          <p className="text-heading-4 color-muted max-w-3xl mx-auto">
            Your data security is our top priority. Learn about the comprehensive measures we take 
            to protect your information and maintain the highest security standards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-xl mb-3xl">
          {securityFeatures.map((feature: any) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-card rounded-lg p-lg border">
                <div className="flex items-center mb-md">
                  <div className="bg-accent/10 p-sm rounded-lg mr-md">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className={`${anton.className} uppercase text-body text-heading-3`}>
                    {feature.title}
                  </h3>
                </div>
                <p className="color-muted">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="prose prose-lg max-w-none stack-xl">
          <section>
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              COMPLIANCE & CERTIFICATIONS
            </h2>
            <div className="grid md:grid-cols-2 gap-lg">
              <div className="bg-secondary/30 p-lg rounded-lg">
                <h3 className="text-heading-4 mb-sm">SOC 2 Type II</h3>
                <p className="text-body-sm color-muted">
                  Independently audited security controls for availability, confidentiality, and processing integrity.
                </p>
              </div>
              <div className="bg-secondary/30 p-lg rounded-lg">
                <h3 className="text-heading-4 mb-sm">ISO 27001</h3>
                <p className="text-body-sm color-muted">
                  International standard for information security management systems (ISMS).
                </p>
              </div>
              <div className="bg-secondary/30 p-lg rounded-lg">
                <h3 className="text-heading-4 mb-sm">GDPR Compliant</h3>
                <p className="text-body-sm color-muted">
                  Full compliance with European data protection regulations and user privacy rights.
                </p>
              </div>
              <div className="bg-secondary/30 p-lg rounded-lg">
                <h3 className="text-heading-4 mb-sm">CCPA Compliant</h3>
                <p className="text-body-sm color-muted">
                  California Consumer Privacy Act compliance for user data rights and transparency.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              DATA PROTECTION
            </h2>
            <div className="stack-md">
              <div>
                <h3>Encryption</h3>
                <p>All data is encrypted using industry-standard AES-256 encryption both in transit and at rest.</p>
              </div>
              <div>
                <h3>Data Residency</h3>
                <p>Your data is stored in secure, geographically distributed data centers with strict access controls.</p>
              </div>
              <div>
                <h3>Backup & Recovery</h3>
                <p>Automated daily backups with point-in-time recovery and disaster recovery procedures.</p>
              </div>
              <div>
                <h3>Data Retention</h3>
                <p>Clear data retention policies with secure deletion procedures when data is no longer needed.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              INCIDENT RESPONSE
            </h2>
            <p>
              We maintain a comprehensive incident response plan with 24/7 monitoring and rapid response capabilities. 
              In the unlikely event of a security incident, we will:
            </p>
            <ul className="list-disc pl-lg stack-sm">
              <li>Immediately contain and assess the incident</li>
              <li>Notify affected users within 72 hours</li>
              <li>Work with law enforcement and regulatory bodies as required</li>
              <li>Provide regular updates throughout the resolution process</li>
              <li>Conduct a thorough post-incident review and implement improvements</li>
            </ul>
          </section>

          <section>
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              SECURITY CONTACT
            </h2>
            <p>
              If you discover a security vulnerability or have security-related questions, please contact our security team:
            </p>
            <div className="bg-secondary/30 p-lg rounded-lg mt-md">
              <p><strong>Email:</strong> <a href="mailto:security@ghxstship.com" className="text-foreground hover:underline">security@ghxstship.com</a></p>
              <p><strong>PGP Key:</strong> Available upon request</p>
              <p><strong>Response Time:</strong> Within 24 hours for critical issues</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
