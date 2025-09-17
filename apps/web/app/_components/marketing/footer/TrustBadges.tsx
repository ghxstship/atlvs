const trustBadges = [
  'SOC 2 Type II Certified',
  'GDPR Compliant',
  'ISO 27001 Certified',
  '99.9% Uptime SLA',
];

export function TrustBadges() {
  return (
    <div className="mt-8 pt-8 border-t text-center">
      <div className="flex flex-wrap justify-center items-center gap-6 text-body-sm color-muted">
        {trustBadges.map((badge) => (
          <span key={badge} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
