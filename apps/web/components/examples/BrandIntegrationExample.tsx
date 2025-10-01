/**
 * Brand Integration Example
 * Demonstrates how to use the brand system in components
 */

'use client';

import { 
  useBrand, 
  useBrandLabel, 
  useBrandTerminology,
  useBrandColors,
  useEnabledModules 
} from '@ghxstship/shared/platform/brand';

export function BrandIntegrationExample() {
  const { brand, loading, error } = useBrand();
  const t = useBrandTerminology();
  const dashboardLabel = useBrandLabel('dashboard');
  const projectsLabel = useBrandLabel('projects');
  const colors = useBrandColors();
  const enabledModules = useEnabledModules();

  if (loading) {
    return <div className="p-md">Loading brand configuration...</div>;
  }

  if (error) {
    return <div className="p-md text-error">Error loading brand: {error.message}</div>;
  }

  if (!brand) {
    return <div className="p-md">No brand configuration found</div>;
  }

  return (
    <div className="p-lg space-y-md">
      <h1 className="font-heading text-4xl font-bold">
        Brand Integration Example
      </h1>

      <section className="p-md border rounded-lg">
        <h2 className="font-heading text-2xl font-semibold mb-sm">Brand Information</h2>
        <dl className="space-y-xs">
          <div>
            <dt className="font-semibold">Brand Name:</dt>
            <dd>{brand.brand.name}</dd>
          </div>
          <div>
            <dt className="font-semibold">Tagline:</dt>
            <dd>{brand.brand.tagline}</dd>
          </div>
          <div>
            <dt className="font-semibold">Brand ID:</dt>
            <dd><code className="font-mono">{brand.brand.id}</code></dd>
          </div>
        </dl>
      </section>

      <section className="p-md border rounded-lg">
        <h2 className="font-heading text-2xl font-semibold mb-sm">Navigation Labels</h2>
        <ul className="space-y-xs">
          <li><strong>Dashboard:</strong> {dashboardLabel}</li>
          <li><strong>Projects:</strong> {projectsLabel}</li>
        </ul>
      </section>

      <section className="p-md border rounded-lg">
        <h2 className="font-heading text-2xl font-semibold mb-sm">Custom Terminology</h2>
        <p className="mb-xs">The brand system automatically replaces terms:</p>
        <ul className="space-y-xs">
          <li>project → <strong>{t('project')}</strong></li>
          <li>team → <strong>{t('team')}</strong></li>
          <li>member → <strong>{t('member')}</strong></li>
          <li>budget → <strong>{t('budget')}</strong></li>
        </ul>
      </section>

      <section className="p-md border rounded-lg">
        <h2 className="font-heading text-2xl font-semibold mb-sm">Brand Colors</h2>
        {colors && (
          <div className="grid grid-cols-2 gap-sm">
            <div>
              <div className="h-component-md rounded" style={{ backgroundColor: colors.primary }}></div>
              <p className="text-sm mt-xs">Primary</p>
            </div>
            <div>
              <div className="h-component-md rounded" style={{ backgroundColor: colors.secondary }}></div>
              <p className="text-sm mt-xs">Secondary</p>
            </div>
            <div>
              <div className="h-component-md rounded" style={{ backgroundColor: colors.accent }}></div>
              <p className="text-sm mt-xs">Accent</p>
            </div>
            <div>
              <div className="h-component-md rounded" style={{ backgroundColor: colors.success }}></div>
              <p className="text-sm mt-xs">Success</p>
            </div>
          </div>
        )}
      </section>

      <section className="p-md border rounded-lg">
        <h2 className="font-heading text-2xl font-semibold mb-sm">Enabled Modules</h2>
        <div className="flex flex-wrap gap-xs">
          {enabledModules.map((module) => (
            <span 
              key={module} 
              className="px-sm py-xs bg-neutral-100 rounded text-sm"
            >
              {module}
            </span>
          ))}
        </div>
      </section>

      <section className="p-md border rounded-lg bg-info/10">
        <h2 className="font-heading text-2xl font-semibold mb-sm">Usage Example</h2>
        <pre className="font-mono text-sm bg-neutral-900 text-neutral-50 p-sm rounded overflow-x-auto">
{`import { useBrandLabel, useBrandTerminology } from '@ghxstship/shared/platform/brand';

function MyComponent() {
  const label = useBrandLabel('projects');
  const t = useBrandTerminology();
  
  return (
    <div>
      <h1>{label}</h1>
      <p>Create a new {t('project')}</p>
    </div>
  );
}`}
        </pre>
      </section>
    </div>
  );
}
