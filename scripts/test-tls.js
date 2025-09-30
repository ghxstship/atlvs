#!/usr/bin/env node

/**
 * TLS Configuration Testing Script
 * Tests TLS settings, security headers, and HTTPS enforcement
 */

const https = require('https');
const { URL } = require('url');

const TEST_URL = process.env.TEST_URL || 'https://localhost:3000';
const VERBOSE = process.argv.includes('--verbose');

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';

  console.log(`${prefix} ${message}`);
  if (VERBOSE && data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function testTLSConnection(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: '/',
      method: 'HEAD',
      rejectUnauthorized: false, // Test even with invalid certificates
    };

    const req = https.request(options, (res) => {
      const tlsInfo = {
        protocol: res.socket.getProtocol(),
        cipher: res.socket.getCipher(),
        authorized: res.socket.authorized,
        authorizationError: res.socket.authorizationError,
      };

      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        tls: tlsInfo,
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function testHTTPRedirect(url) {
  return new Promise((resolve) => {
    const httpUrl = url.replace('https:', 'http:');
    const parsedUrl = new URL(httpUrl);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: '/',
      method: 'HEAD',
    };

    const req = https.request(options, (res) => {
      resolve({
        redirected: res.statusCode === 301 || res.statusCode === 302,
        statusCode: res.statusCode,
        location: res.headers.location,
      });
    });

    req.on('error', () => resolve({ redirected: false, error: 'Connection failed' }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ redirected: false, error: 'Timeout' });
    });
    req.end();
  });
}

function checkTLSVersion(protocol) {
  const version = protocol?.toLowerCase();
  if (version?.includes('tlsv1.3')) {
    return { valid: true, level: 'excellent' };
  } else if (version?.includes('tlsv1.2')) {
    return { valid: true, level: 'good' };
  } else {
    return { valid: false, level: 'poor' };
  }
}

function checkSecurityHeaders(headers) {
  const checks = {
    hsts: headers['strict-transport-security'] ? 'present' : 'missing',
    csp: headers['content-security-policy'] ? 'present' : 'missing',
    xFrameOptions: headers['x-frame-options'] || 'missing',
    xContentTypeOptions: headers['x-content-type-options'] || 'missing',
    referrerPolicy: headers['referrer-policy'] || 'missing',
  };

  return checks;
}

function checkCSP(headers) {
  const csp = headers['content-security-policy'];
  if (!csp) return { valid: false, issues: ['CSP header missing'] };

  const issues = [];
  const directives = csp.split(';').map(d => d.trim());

  // Check for upgrade-insecure-requests
  if (!csp.includes('upgrade-insecure-requests')) {
    issues.push('Missing upgrade-insecure-requests directive');
  }

  // Check for unsafe-inline in script-src (should be avoided)
  const scriptSrc = directives.find(d => d.startsWith('script-src'));
  if (scriptSrc && scriptSrc.includes("'unsafe-inline'")) {
    issues.push('Avoid unsafe-inline in script-src when possible');
  }

  return {
    valid: issues.length === 0,
    issues,
    directives: directives.length,
  };
}

async function runTests() {
  console.log('🔒 TLS Configuration Testing\n');
  console.log(`Testing URL: ${TEST_URL}\n`);

  try {
    // Test HTTPS connection
    console.log('1. Testing HTTPS Connection...');
    const httpsResult = await testTLSConnection(TEST_URL);

    const tlsCheck = checkTLSVersion(httpsResult.tls?.protocol);
    if (tlsCheck.valid) {
      log('info', `TLS ${tlsCheck.level}: ${httpsResult.tls?.protocol}`);
    } else {
      log('error', `TLS version too old: ${httpsResult.tls?.protocol}`);
    }

    // Test HTTP to HTTPS redirect
    console.log('\n2. Testing HTTP Redirect...');
    const redirectResult = await testHTTPRedirect(TEST_URL);
    if (redirectResult.redirected) {
      log('info', 'HTTP to HTTPS redirect working');
    } else {
      log('warn', 'HTTP to HTTPS redirect not working');
      if (VERBOSE) console.log('Redirect result:', redirectResult);
    }

    // Check security headers
    console.log('\n3. Checking Security Headers...');
    const headerChecks = checkSecurityHeaders(httpsResult.headers);

    Object.entries(headerChecks).forEach(([header, status]) => {
      if (status === 'present' || status === 'DENY' || status === 'nosniff') {
        log('info', `${header}: ${status}`);
      } else {
        log('warn', `${header}: ${status}`);
      }
    });

    // Check CSP
    console.log('\n4. Checking Content Security Policy...');
    const cspCheck = checkCSP(httpsResult.headers);
    if (cspCheck.valid) {
      log('info', `CSP: ${cspCheck.directives} directives`);
    } else {
      log('warn', 'CSP issues found:');
      cspCheck.issues.forEach(issue => log('warn', `  - ${issue}`));
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`Status Code: ${httpsResult.statusCode}`);
    console.log(`TLS Protocol: ${httpsResult.tls?.protocol}`);
    console.log(`Cipher: ${httpsResult.tls?.cipher?.name}`);

    const allGood =
      tlsCheck.valid &&
      redirectResult.redirected &&
      headerChecks.hsts === 'present' &&
      headerChecks.csp === 'present' &&
      cspCheck.valid;

    if (allGood) {
      log('info', '\n🎉 All TLS checks passed!');
    } else {
      log('warn', '\n⚠️  Some TLS checks failed. Review configuration.');
    }

  } catch (error) {
    log('error', 'Test failed:', error.message);
    if (VERBOSE) console.error(error);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testTLSConnection, testHTTPRedirect, checkTLSVersion, checkSecurityHeaders, checkCSP };
