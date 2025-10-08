#!/bin/bash

# Fix all TypeScript and remaining lint errors
set -e

APPS_WEB="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web"
cd "$APPS_WEB"

echo "🔧 Fixing TypeScript errors in onboarding steps..."

# Fix OrganizationSetupStep.tsx
echo "📝 Fixing OrganizationSetupStep.tsx..."
perl -i -pe '
  s/interface OrganizationSetupStepProps \{/interface OrganizationSetupStepProps {/;
  s/  user;/  user: any;/;
  s/  data;/  data: any;/;
  s/} catch \(err\) \{/} catch (err: any) {/g;
  s/setError\(err\.message/setError(err?.message || "An error occurred"/g;
' app/auth/onboarding/steps/OrganizationSetupStep.tsx

# Fix PlanSelectionStep.tsx
echo "📝 Fixing PlanSelectionStep.tsx..."
perl -i -pe '
  s/interface PlanSelectionStepProps \{/interface PlanSelectionStepProps {/;
  s/  data;/  data: any;/;
  s/plan\.features\.map\(\(feature, index\)/plan.features.map((feature: any, index: number)/g;
' app/auth/onboarding/steps/PlanSelectionStep.tsx

# Fix ProfileCompletionStep.tsx
echo "📝 Fixing ProfileCompletionStep.tsx..."
perl -i -pe '
  s/interface ProfileCompletionStepProps \{/interface ProfileCompletionStepProps {/;
  s/  user;/  user: any;/;
  s/  data;/  data: any;/;
  s/} catch \(err\) \{/} catch (err: any) {/g;
  s/setError\(err\.message/setError(err?.message || "An error occurred"/g;
  s/onChange=\{handleInputChange\}/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(e as any)}/g if /select/;
  s/onChange=\{handleInputChange\}/onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(e as any)}/g if /textarea/;
' app/auth/onboarding/steps/ProfileCompletionStep.tsx

# Fix TeamInvitationStep.tsx
echo "📝 Fixing TeamInvitationStep.tsx..."
perl -i -pe '
  s/interface TeamInvitationStepProps \{/interface TeamInvitationStepProps {/;
  s/  user;/  user: any;/;
  s/  data;/  data: any;/;
  s/} catch \(err\) \{/} catch (err: any) {/g;
  s/setError\(err\.message/setError(err?.message || "An error occurred"/g;
  s/onChange=\{handleInvitationChange\}/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInvitationChange(e as any)}/g if /select/;
' app/auth/onboarding/steps/TeamInvitationStep.tsx

echo "✅ TypeScript interface fixes complete!"

# Fix remaining apostrophes in OrganizationSetupStep
echo "📝 Fixing remaining apostrophes..."
perl -i -pe '
  s/organization\047s/organization\&apos;s/g;
  s/you\047ll/you\&apos;ll/g;
' app/auth/onboarding/steps/OrganizationSetupStep.tsx app/auth/onboarding/steps/TeamInvitationStep.tsx

echo "✅ Apostrophe fixes complete!"

echo "🎯 All TypeScript error fixes applied!"
