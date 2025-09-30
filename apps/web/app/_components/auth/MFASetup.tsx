import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@ghxstship/ui';
import { Shield, Smartphone, Key } from 'lucide-react';

interface MFAFactor {
  id: string;
  factor_type: 'totp' | 'phone';
  status: 'verified' | 'unverified';
  friendly_name?: string;
}

interface MFAChallenge {
  id: string;
  factor_id: string;
  type: 'totp' | 'phone';
  qr_code?: string;
  uri?: string;
}

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [selectedFactor, setSelectedFactor] = useState<MFAFactor | null>(null);
  const [challenge, setChallenge] = useState<MFAChallenge | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'setup' | 'verify'>('select');

  const supabase = createClient();

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: factors, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      setFactors(factors?.all as MFAFactor[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MFA factors');
    }
  };

  const enrollTOTP = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) throw error;

      // Set challenge data
      setChallenge({
        id: data.id,
        factor_id: data.id,
        type: 'totp',
        qr_code: data.totp?.qr_code,
        uri: data.totp?.uri
      });
      setStep('setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll TOTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (!challenge || !verificationCode) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.mfa.verify({
        factorId: challenge.factor_id,
        code: verificationCode,
        challengeId: challenge.id
      });

      if (error) throw error;

      await loadFactors();
      setStep('select');
      setChallenge(null);
      setVerificationCode('');
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const disableFactor = async (factorId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.mfa.unenroll({
        factorId
      });

      if (error) throw error;

      await loadFactors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'setup' && challenge) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Set up Authenticator App</h3>
          <p className="text-sm text-muted-foreground">
            Scan the QR code with your authenticator app, then enter the 6-digit code.
          </p>
        </div>

        {challenge.qr_code && (
          <div className="flex justify-center">
            <img
              src={`data:image/png;base64,${challenge.qr_code}`}
              alt="QR Code for TOTP setup"
              className="border rounded-lg"
            />
          </div>
        )}

        {challenge.uri && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Or manually enter:</p>
            <code className="text-xs bg-muted p-2 rounded block">
              {challenge.uri}
            </code>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              className="w-full p-2 border rounded-md"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={verifyTOTP}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep('select')}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Multi-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account.
        </p>
      </div>

      {/* Current Factors */}
      {factors.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Active MFA Methods</h4>
          {factors.map((factor) => (
            <div key={factor.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                {factor.factor_type === 'totp' ? (
                  <Smartphone className="h-5 w-5 text-primary" />
                ) : (
                  <Key className="h-5 w-5 text-primary" />
                )}
                <div>
                  <div className="font-medium">{factor.friendly_name || 'Authenticator App'}</div>
                  <div className="text-sm text-muted-foreground capitalize">{factor.status}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => disableFactor(factor.id)}
                disabled={loading}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Factor */}
      <div className="space-y-3">
        <h4 className="font-medium">Add MFA Method</h4>
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            onClick={enrollTOTP}
            disabled={loading}
            className="justify-start"
          >
            <Smartphone className="h-5 w-5 mr-3" />
            Authenticator App (TOTP)
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={onComplete} variant="outline" className="flex-1">
          Skip for Now
        </Button>
        <Button onClick={onCancel} variant="ghost">
          Cancel
        </Button>
      </div>
    </div>
  );
}
