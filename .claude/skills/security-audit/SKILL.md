---
name: security-audit
description: Scans code for security vulnerabilities - OWASP Top 10, secrets, dependencies
---

When auditing security ($ARGUMENTS):

1. **Scan for OWASP Top 10**:
   - Injection (SQL, NoSQL, command, LDAP)
   - Broken authentication
   - Sensitive data exposure
   - XXE, XSS, CSRF
   - Insecure deserialization
   - Security misconfiguration

2. **Check for secrets**:
   - Hardcoded API keys, tokens, passwords
   - .env files committed to git
   - Credentials in logs or error messages

3. **Dependency audit**:
   - Run `npm audit` or equivalent
   - Check for known CVEs
   - Identify outdated packages

4. **Code patterns**:
   - Input validation and sanitization
   - Proper use of crypto/hashing
   - Secure HTTP headers
   - CORS configuration
   - Rate limiting

5. **Report** findings with severity levels:
   - **CRITICAL**: Immediate exploitation risk
   - **HIGH**: Significant vulnerability
   - **MEDIUM**: Potential risk under certain conditions
   - **LOW**: Best practice improvement
