# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x (Release Candidate) | ✅ |
| < 1.0 | ❌ (prototype) |

## Reporting a Vulnerability

If you discover a security vulnerability in Forge, please report it by
opening an issue at https://github.com/forgebuild/forge/issues with the
label `security`. Do **not** open a public issue for critical vulnerabilities.

We will acknowledge receipt within 48 hours and provide a timeline for
resolution within 5 business days.

## Security Measures

Forge implements the following security measures:

- **Context isolation** enabled (`contextIsolation: true`)
- **Node integration** disabled (`nodeIntegration: false`)
- **Content Security Policy** with strict rules (frame-ancestors, form-action, base-uri)
- **Input validation** on all IPC handlers
- **No eval()**, **no innerHTML**, **no dangerouslySetInnerHTML**
- **All localStorage operations** wrapped in try/catch
- **External links** use `rel="noreferrer"`
