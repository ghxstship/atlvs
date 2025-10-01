import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@ghxstship/ui';
import { Shield, Smartphone } from 'lucide-react';

interface MFAVerifyProps {
  factors: any[];
  onVerified: (session: any) => void;
  onCancel: () => void;
}

export function MFAVerify({ factors, onVerified, onCancel }: MFAVerifyProps) {
  const [selectedFactor, setSelectedFactor] = useState(factors[0]?.id || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const verifyMFA = async () => {
    if (!selectedFactor || !verificationCode) return;

    try {
      setLoading(true);
      setError(null);

      // Use Supabase MFA challenge flow
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: selectedFactor,
      });

      if (challengeError) throw challengeError;

      const { data, error } = await supabase.auth.mfa.verify({
        factorId: selectedFactor,
        code: verificationCode,
        challengeId: challenge.id,
      });

      if (error) throw error;

      onVerified({ session: data, code: verificationCode });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div className="text-center">
        <Shield className="h-icon-2xl w-icon-2xl text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      {factors.length > 1 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select MFA Method
          </label>
          <select
            value={selectedFactor}
            onChange={(e) => setSelectedFactor(e.target.value)}
            className="w-full p-xs border rounded-md"
          >
            {factors.map((factor: any) => (
              <option key={factor.id} value={factor.id}>
                {factor.friendly_name || 'Authenticator App'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="000000"
          className="w-full p-sm border rounded-md text-center text-lg font-mono"
          maxLength={6}
          autoFocus
        />
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-sm rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-sm">
        <Button
          onClick={verifyMFA}
          disabled={loading || verificationCode.length !== 6}
          className="flex-1"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Use Different Method
        </Button>
      </div>
    </div>
  );
}
