---
trigger: model_decision
description: Security and privacy rules for input validation, secret protection, certificate document security, and data minimization.
---

# Security & Privacy Rules — Halal Finder

## Sacred Rules

- **Never commit secrets.** Database connection strings, Supabase service keys, and third-party API credentials belong in `.env`.
- **Never expose backend service keys in frontend code.** Only publish safe, public read-only anonymous client keys where required by design.
- **Never log secrets, connection strings, or sensitive payloads.**
- **Never bypass pre-commit hooks or verification guards** (`--no-verify`).

## Attack Surface & Defenses

### 1. Document & Certificate Storage Security
- Business certificate uploads (PDFs, images) frequently contain sensitive business details, private contact info, and internal audit notes.
- **Strict Rule:** Store certificate documents in private, access-restricted storage buckets. Never place raw certificate documents in public, unauthenticated buckets or URLs.
- Access to uploaded evidence documents must require moderator authentication and audit logging.

### 2. User Privacy & Location Minimization
- **No Forced Location:** Do NOT require device GPS to browse or search listings. Always allow manual city and postcode search.
- **Explicit Consent:** If device geolocation is requested, clearly explain why and request explicit browser permission.
- **No Unnecessary Location Tracking:** Do not store precise user location trails or personal browsing histories.
- Saved places are stored locally on device by default (`localStorage`).

### 3. Input Validation & Content Sanitization
- All user-submitted content (business suggestions, correction reports, review comments) must be sanitized against HTML injection and XSS before rendering or storing.
- Sanitize and validate numeric barcodes: reject non-numeric characters and strings outside 8–14 digits.
- Validate geographic coordinates: latitude between -90 and +90, longitude between -180 and +180.

### 4. Error Information Leakage
- Never expose raw database stack traces or SQL/ORM error objects in API responses.
- Map all errors to clean user-facing error envelopes: `{ error: { message: string, code?: string } }`.

### 5. Rate Limiting & Abuse Prevention
- Rate limit public barcode lookup requests and business listing submissions to prevent scraping or denial-of-service abuse.
- Treat Open Food Facts and external tile servers respectfully: cache responses to avoid hammering external infrastructure.
