import { useState } from 'react';
import { Card, CardContent } from '@ghxstship/ui';
import { HelpCircle } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';
import { typography } from '../../lib/typography';
import { layouts } from '../../lib/layouts';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className={layouts.sectionPadding}>
      <div className={layouts.container}>
        <div className="text-center mb-16">
          <h2 className={`${typography.sectionTitle} mb-6`}>
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className={`${typography.sectionSubtitle}`}>
            Have questions about our pricing? We've got answers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-secondary/30 transition-colors"
                  >
                    <span className="text-heading-4 color-foreground">{faq.question}</span>
                    <HelpCircle className={cn(
                      "h-5 w-5 color-muted transition-transform",
                      openFaq === index ? "rotate-180" : ""
                    )} />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="color-muted">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
