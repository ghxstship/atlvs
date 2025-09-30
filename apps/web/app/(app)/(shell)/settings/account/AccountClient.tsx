'use client';

import AccountSettingsClient from './AccountSettingsClient';
import type { AccountClientProps } from './types';

export default function AccountClient({ userId, orgId }: AccountClientProps) {
  void userId;
  void orgId;
  return <AccountSettingsClient />;
}
