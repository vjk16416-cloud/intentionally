# Microsoft Clarity Setup

Microsoft Clarity is loaded through a small App Router provider at the root of
the app. The script is only injected when the public project ID is configured.

## Environment Variable

Add the project ID only. Do not add account credentials or private API keys.

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

The project ID is public by design because it is used by the browser-side
tracking script.

## Setup

1. Create or open the Intentionally project in Microsoft Clarity.
2. Copy the project ID from the project setup page.
3. Set `NEXT_PUBLIC_CLARITY_PROJECT_ID` in the target environment.
4. Redeploy the app.
5. Visit the site and confirm sessions appear in Clarity after data processing.

## Privacy Notes

- Do not call Clarity's identify, custom tag, or custom event APIs with names,
  emails, phone numbers, chat messages, Q&A answers, transcripts, or safety
  contact details.
- The current integration only loads the standard Clarity script. It does not
  manually send any user-entered values or product data.
- Review Clarity masking settings before a real-user beta, especially for
  forms, chat, onboarding, Q&A, and date-planning screens.
- Clarity should not be used on websites or apps targeting users under 18.

## Reference

Microsoft setup documentation:
https://learn.microsoft.com/clarity/setup-and-installation/clarity-setup
