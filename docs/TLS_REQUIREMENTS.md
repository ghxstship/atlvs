# TLS Requirements and HTTPS Enforcement

## Overview

GHXSTSHIP implements comprehensive Transport Layer Security (TLS) requirements to ensure secure communication between clients and servers. This document outlines the TLS requirements, implementation details, and enforcement mechanisms.

## TLS Requirements

### Minimum TLS Version
- **Required**: TLS 1.3
- **Fallback**: TLS 1.2 (with appropriate cipher suites)
- **Prohibited**: TLS 1.0, TLS 1.1

### Supported Cipher Suites (TLS 1.3)
- TLS_AES_256_GCM_SHA384
- TLS_CHACHA20_POLY1305_SHA256
- TLS_AES_128_GCM_SHA256

### Certificate Requirements
- **Type**: Valid X.509 certificates from trusted Certificate Authorities (CA)
- **Key Size**: Minimum 2048-bit RSA or equivalent ECC curve
- **Validation**: Full certificate chain validation required
- **HSTS**: HTTP Strict Transport Security enabled

### Protocol Requirements
- **HTTPS Only**: All HTTP traffic must be redirected to HTTPS
- **Secure Cookies**: All authentication and session cookies must have `Secure` and `HttpOnly` flags
- **Mixed Content**: Strict CSP prevents mixed HTTP/HTTPS content

## Implementation Details

### Next.js Configuration

The application uses Next.js with comprehensive security headers:

```javascript
// next.config.mjs
{
  headers: [
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; upgrade-insecure-requests"
    }
  ]
}
```

### Middleware Enforcement

The application middleware enforces HTTPS through multiple layers:

1. **Automatic HTTP to HTTPS Redirect**
2. **HSTS Header Enforcement**
3. **CSP with upgrade-insecure-requests**
4. **Secure Cookie Requirements**

### Environment Variables

Required environment variables for TLS configuration:

```bash
# HTTPS Enforcement
NODE_ENV=production

# Certificate Configuration (for custom certificates)
SSL_CERT_PATH=/path/to/certificate.crt
SSL_KEY_PATH=/path/to/private.key

# HSTS Configuration
HSTS_MAX_AGE=63072000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true
```

## HTTPS Enforcement Mechanisms

### 1. Reverse Proxy (Recommended for Production)

For production deployments, use a reverse proxy like Nginx or Cloudflare:

```nginx
# Nginx configuration example
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Application-Level Enforcement

The middleware enforces HTTPS at the application level:

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.nextUrl.protocol === 'http:') {
    const httpsUrl = req.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl);
  }

  // Additional security headers
  const response = NextResponse.next();
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return response;
}
```

### 3. Cloud Platform Configuration

#### Vercel
```json
{
  "functions": {
    "middleware.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

#### AWS CloudFront + S3/Lambda
- Use CloudFront distribution with custom SSL certificate
- Configure origin to force HTTPS
- Set HSTS headers in Lambda@Edge or CloudFront Functions

#### Azure
```json
{
  "properties": {
    "httpsOnly": true,
    "customDomainVerificationId": "...",
    "sslSettings": {
      "certificate": {
        "certificateSource": "KeyVault",
        "keyVaultSecretName": "certificate-name"
      }
    }
  }
}
```

## Monitoring and Compliance

### Certificate Monitoring
- Monitor certificate expiration dates
- Automated renewal through ACME (Let's Encrypt) or commercial CAs
- Alert on certificate validation failures

### TLS Handshake Monitoring
- Log TLS handshake failures
- Monitor TLS version usage
- Track cipher suite preferences

### Security Headers Validation
- Regular scans for missing security headers
- CSP violation reporting
- HSTS preload list monitoring

## Testing TLS Configuration

### SSL Labs Test
Use SSL Labs to test TLS configuration:
```bash
# Test with SSL Labs API
curl -s "https://api.ssllabs.com/api/v3/analyze?host=ghxstship.com" | jq .
```

### OpenSSL Testing
```bash
# Test TLS connection
openssl s_client -connect ghxstship.com:443 -tls1_3

# Check certificate
openssl s_client -connect ghxstship.com:443 -showcerts
```

### Security Headers Testing
```bash
# Test security headers
curl -I https://ghxstship.com

# Check HSTS
curl -I https://ghxstship.com | grep -i strict-transport-security
```

## Troubleshooting

### Common Issues

1. **Mixed Content Warnings**
   - Ensure all resources load over HTTPS
   - Update CSP to prevent mixed content
   - Use `upgrade-insecure-requests` directive

2. **HSTS Issues**
   - Clear HSTS cache in browsers during development
   - Use shorter max-age during testing
   - Verify preload list submission

3. **Certificate Problems**
   - Check certificate chain completeness
   - Verify certificate validity dates
   - Ensure proper intermediate certificates

### Debug Commands

```bash
# Check current TLS version
curl -vI https://ghxstship.com 2>&1 | grep -E "(SSL|TLS)"

# Test specific TLS version
openssl s_client -connect ghxstship.com:443 -tls1_2
openssl s_client -connect ghxstship.com:443 -tls1_3

# Check certificate details
echo | openssl s_client -servername ghxstship.com -connect ghxstship.com:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer
```

## Compliance Standards

This TLS implementation complies with:
- **PCI DSS 4.0**: TLS 1.2 minimum, strong cryptography
- **NIST SP 800-52**: TLS guidelines for federal systems
- **OWASP ASVS 4.0**: Secure communication requirements
- **ISO 27001**: Information security controls

## Maintenance

### Certificate Renewal
- Monitor expiration dates (alert 30 days before)
- Automated renewal for Let's Encrypt certificates
- Manual renewal process for commercial certificates

### Configuration Updates
- Regular review of cipher suite support
- Update to new TLS versions as they become available
- Monitor for deprecated protocols/ciphers

### Security Updates
- Keep server software updated
- Monitor for TLS vulnerabilities (Heartbleed, POODLE, etc.)
- Regular security assessments
