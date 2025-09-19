import { Metadata } from 'next';
import { anton } from '../../_components/lib/typography';

export const metadata: Metadata = {
  title: 'Cookie Policy | GHXSTSHIP',
  description: 'Learn about how GHXSTSHIP uses cookies to improve your experience on our platform.',
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-md py-3xl max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <h1 className={`${anton.className} uppercase text-heading-1 text-heading-3 mb-xl`}>
          COOKIE POLICY
        </h1>
        
        <p className="text-body color-muted mb-xl">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="stack-xl">
          <section>
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              WHAT ARE COOKIES
            </h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </section>

          <section>
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              HOW WE USE COOKIES
            </h2>
            <p>We use cookies for several purposes:</p>
            <ul className="list-disc pl-lg stack-sm">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              TYPES OF COOKIES WE USE
            </h2>
            <div className="stack-md">
              <div>
                <h3>Strictly Necessary Cookies</h3>
                <p>These cookies are essential for the website to function and cannot be disabled.</p>
              </div>
              <div>
                <h3>Performance Cookies</h3>
                <p>These cookies collect information about how you use our website to help us improve it.</p>
              </div>
              <div>
                <h3>Functional Cookies</h3>
                <p>These cookies remember your preferences and provide enhanced features.</p>
              </div>
              <div>
                <h3>Targeting Cookies</h3>
                <p>These cookies are used to deliver relevant advertisements based on your interests.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              MANAGING COOKIES
            </h2>
            <p>
              You can control and manage cookies in various ways. Most browsers allow you to:
            </p>
            <ul className="list-disc pl-lg stack-sm">
              <li>View what cookies are stored on your device</li>
              <li>Delete cookies individually or all at once</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies from being set</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
          </section>

          <section>
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              THIRD-PARTY COOKIES
            </h2>
            <p>
              We may use third-party services that set cookies on our website, including:
            </p>
            <ul className="list-disc pl-lg stack-sm">
              <li>Google Analytics for website analytics</li>
              <li>Social media platforms for sharing content</li>
              <li>Advertising networks for targeted ads</li>
            </ul>
          </section>

          <section>
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              CONTACT US
            </h2>
            <p>
              If you have any questions about our Cookie Policy, please contact us at{' '}
              <a href="mailto:privacy@ghxstship.com" className="text-foreground hover:underline">
                privacy@ghxstship.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
