const trustBadges = [
  'SOC 2 Type II Certified',
  'GDPR Compliant',
  'ISO 27001 Certified',
  '99.9% Uptime SLA',
];

export function TrustBadges() {
  return (
    <div className="mt-md pt-xl border-t text-center">
      <div className="flex flex-wrap justify-center items-center gap-xl text-body-sm color-muted">
        {trustBadges.map((badge) => (
          <span key={badge} className="flex items-center gap-xl">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
