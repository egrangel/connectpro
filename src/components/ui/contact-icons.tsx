/**
 * Contact icons, inlined rather than fetched: the app serves no external
 * assets, and `currentColor` lets each icon inherit its link's colour.
 *
 * Brand marks (WhatsApp, Instagram) are drawn as their real glyphs so they are
 * recognizable at a glance; the generic ones (phone, mail, globe) are outlines
 * on the same 24×24 grid.
 */

interface IconProps {
  className?: string;
}

const outlineProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: "false" as const,
};

export function WhatsappIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.28-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.18.2-.35.23-.65.08-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.77-1.65-2.06-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35" />
      <path d="M12.05 2C6.5 2 2 6.5 2 12.05c0 1.77.46 3.5 1.34 5.03L2 22l5.06-1.33a10 10 0 0 0 4.99 1.33h.01c5.54 0 10.04-4.5 10.04-10.05C22.1 6.5 17.6 2 12.05 2Zm0 18.1a8.35 8.35 0 0 1-4.25-1.16l-.3-.18-3.16.83.84-3.08-.2-.32a8.34 8.34 0 0 1-1.28-4.44 8.36 8.36 0 0 1 14.27-5.9 8.3 8.3 0 0 1 2.45 5.9 8.36 8.36 0 0 1-8.37 8.35Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg {...outlineProps} className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...outlineProps} className={className}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3.2 6.6 7.9 5.3a1.6 1.6 0 0 0 1.8 0l7.9-5.3" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...outlineProps} className={className}>
      <path d="M21.5 16.9v2.6a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6 2 2 0 0 1 2-2.2h2.6a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.4 10a15.8 15.8 0 0 0 6 6l1.7-1.7a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

export function WebsiteIcon({ className }: IconProps) {
  return (
    <svg {...outlineProps} className={className}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.9 9.5h18.2M2.9 14.5h18.2" />
      <path d="M12 2.5a14.5 14.5 0 0 1 0 19 14.5 14.5 0 0 1 0-19Z" />
    </svg>
  );
}
