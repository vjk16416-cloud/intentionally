import Script from "next/script";

export function ClarityProvider() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const enabled = process.env.NEXT_PUBLIC_CLARITY_ENABLED === "true";

  // Session recording is disabled unless it has been deliberately enabled.
  // Founder approval must cover consent, masking and retention before setting
  // NEXT_PUBLIC_CLARITY_ENABLED=true for a private-beta environment.
  if (!projectId || !enabled) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", ${JSON.stringify(projectId)});
      `}
    </Script>
  );
}
