import { z } from 'zod';

const BaseResponseSchema = z
  .object({
    error: z.string().optional(),
  })
  .passthrough();

export class SettingsNotificationsError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SettingsNotificationsError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? BaseResponseSchema.parse(JSON.parse(text)) : {};
  if (!response.ok) {
    throw new SettingsNotificationsError(payload.error ?? 'Request failed', response.status);
  }

  return payload as T;
}

async function jsonFetch(url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });
}

export const NotificationTypeSchema = z.enum(['email', 'sms', 'push', 'in_app']);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationFrequencySchema = z.enum(['immediate', 'hourly', 'daily', 'weekly']);
export type NotificationFrequency = z.infer<typeof NotificationFrequencySchema>;

export const NotificationCategorySchema = z.enum([
  'project_updates',
  'job_assignments',
  'financial_alerts',
  'system_notifications',
  'security_alerts',
  'marketplace_activity',
  'training_reminders',
  'compliance_updates',
  'approval_requests',
]);
export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;

export const NotificationPreferenceSchema = z.object({
  type: NotificationTypeSchema,
  enabled: z.boolean(),
  frequency: NotificationFrequencySchema.optional(),
  categories: z.array(NotificationCategorySchema).optional(),
});
export type NotificationPreference = z.infer<typeof NotificationPreferenceSchema>;

export const QuietHoursSchema = z.object({
  enabled: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  timezone: z.string(),
});
export type QuietHoursSettings = z.infer<typeof QuietHoursSchema>;

export const NotificationGlobalSettingsSchema = z.object({
  quietHours: QuietHoursSchema.optional(),
  digestEnabled: z.boolean().optional(),
  digestFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  digestTime: z.string().optional(),
});
export type NotificationGlobalSettings = z.infer<typeof NotificationGlobalSettingsSchema>;

export const NotificationSettingsResponseSchema = z.object({
  preferences: z.array(NotificationPreferenceSchema),
  globalSettings: NotificationGlobalSettingsSchema,
});
export type NotificationSettingsResponse = z.infer<typeof NotificationSettingsResponseSchema>;

export interface UpdateNotificationSettingsInput {
  userId?: string;
  preferences?: NotificationPreference[];
  globalSettings?: NotificationGlobalSettings;
}

const UpdateNotificationSettingsInputSchema = z.object({
  userId: z.string().optional(),
  preferences: z.array(NotificationPreferenceSchema).optional(),
  globalSettings: NotificationGlobalSettingsSchema.partial().optional(),
});

export interface TestNotificationInput {
  type: NotificationType;
  message?: string;
}

const TestNotificationInputSchema = z.object({
  type: NotificationTypeSchema,
  message: z.string().optional(),
});

export async function fetchNotificationSettings(userId?: string): Promise<NotificationSettingsResponse> {
  const url = userId ? `/api/v1/settings/notifications?userId=${encodeURIComponent(userId)}` : '/api/v1/settings/notifications';
  const response = await jsonFetch(url);
  return handleResponse<NotificationSettingsResponse>(response);
}

export async function updateNotificationSettings(input: UpdateNotificationSettingsInput): Promise<{ success: true; message: string; }> {
  const payload = UpdateNotificationSettingsInputSchema.parse(input);
  const response = await jsonFetch('/api/v1/settings/notifications', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function sendTestNotification(input: TestNotificationInput): Promise<{ success: true; message: string; }> {
  const payload = TestNotificationInputSchema.parse(input);
  const response = await jsonFetch('/api/v1/settings/notifications', {
    method: 'POST',
    body: JSON.stringify({ action: 'test_notification', ...payload }),
  });
  return handleResponse(response);
}

export async function markAllNotificationsRead(): Promise<{ success: true; message: string; }> {
  const response = await jsonFetch('/api/v1/settings/notifications', {
    method: 'POST',
    body: JSON.stringify({ action: 'mark_all_read' }),
  });
  return handleResponse(response);
}

export async function resetNotificationPreferences(userId?: string): Promise<{ success: true; message: string; }> {
  const response = await jsonFetch('/api/v1/settings/notifications', {
    method: 'DELETE',
    body: JSON.stringify({ action: 'reset_preferences', userId }),
  });
  return handleResponse(response);
}

export async function deleteNotification(notificationId: string): Promise<{ success: true; message: string; }> {
  const response = await jsonFetch('/api/v1/settings/notifications', {
    method: 'DELETE',
    body: JSON.stringify({ action: 'delete_notification', notificationId }),
  });
  return handleResponse(response);
}
