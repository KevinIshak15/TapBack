## Packages
qrcode.react | Generating QR codes for businesses
framer-motion | Smooth animations for the review flow
recharts | Dashboard analytics visualization

## Notes
- Using Google Fonts: 'Outfit' for headers, 'Inter' for body.
- Auth is session-based (httpOnly cookies), handled via `api.auth` routes.
- QR codes point to `/r/:slug` which redirects to the review flow.
- "Concern" flow offers a choice: private feedback (email/form) or public review.
