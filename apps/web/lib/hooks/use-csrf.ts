import { useState, useEffect } from 'react';

const CSRF_TOKEN_NAME = 'csrf-token';

/**
 * Hook to manage CSRF token for client-side requests
 */
export function useCSRFToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get token from document head (set by server)
    const metaToken = document.querySelector(`meta[name="${CSRF_TOKEN_NAME}"]`)?.getAttribute('content');
    if (metaToken) {
      setCsrfToken(metaToken);
      setLoading(false);
      return;
    }

    // Fallback: fetch token from API
    fetchCSRFToken();
  }, []);

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        const token = response.headers.get(CSRF_TOKEN_NAME);
        if (token) {
          setCsrfToken(token);
        }
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    setLoading(true);
    await fetchCSRFToken();
  };

  return {
    csrfToken,
    loading,
    refreshToken,
  };
}

/**
 * Add CSRF token to fetch request headers
 */
export function addCSRFTokenToHeaders(headers: HeadersInit = {}, csrfToken?: string | null): HeadersInit {
  const token = csrfToken || getCSRFTokenFromMeta();
  if (!token) return headers;

  return {
    ...headers,
    'X-CSRF-Token': token,
  };
}

/**
 * Add CSRF token to FormData
 */
export function addCSRFTokenToFormData(formData: FormData, csrfToken?: string | null): FormData {
  const token = csrfToken || getCSRFTokenFromMeta();
  if (token) {
    formData.append(CSRF_TOKEN_NAME, token);
  }
  return formData;
}

/**
 * Get CSRF token from meta tag (server-rendered)
 */
function getCSRFTokenFromMeta(): string | null {
  return document.querySelector(`meta[name="${CSRF_TOKEN_NAME}"]`)?.getAttribute('content') || null;
}

/**
 * CSRF-protected fetch wrapper
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {},
  csrfToken?: string | null
): Promise<Response> {
  const token = csrfToken || getCSRFTokenFromMeta();

  const headers = addCSRFTokenToHeaders(options.headers, token);

  return fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });
}
