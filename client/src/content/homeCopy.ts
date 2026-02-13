// src/content/homeCopy.ts
export const homeCopy = {
  brand: {
    name: "RevsBoost",
    tagline: "Scan → Tap → Review",
  },

  nav: {
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Features", href: "/features" },
      { label: "Insights", href: "/insights" },
      { label: "Testimonials", href: "/#testimonials" },
      { label: "Pricing", href: "/pricing" },
      { label: "Book a demo", href: "/#book-demo" },
    ],
    ctas: {
      primary: { label: "Get Started", href: "/signup" },
      secondary: { label: "Login", href: "/login" },
    },
  },

  hero: {
    headline: "Turn customer feedback into reviews that drive growth.",
    subheadline:
      "RevsBoost makes it effortless for real customers to leave Google reviews. Custom QR templates, an AI-assisted draft (always editable), and a dashboard that shows what's working.",
    ctas: {
      primary: { label: "Get Started Free", href: "/signup" },
      secondary: { label: "Book a demo", href: "/#book-demo" },
    },
    trustLine: "No fake reviews. No auto-posting. Customers stay in control.",
    microPoints: [
      "Print-ready QR templates",
      "3 regenerations max",
      "Concern flow still allows Google review",
    ],
  },

  howItWorks: {
    id: "how-it-works",
    eyebrow: "How it works",
    title: "Scan. Tap. Review.",
    subtitle:
      "A simple flow that reduces friction and helps customers write clear, authentic reviews.",
    steps: [
      {
        title: "Add your business",
        body: "Set your Google review link and choose what customers can mention.",
      },
      {
        title: "Download QR templates",
        body: "Pick a theme and print a poster, counter card, or sticker, ready to use.",
      },
      {
        title: "Collect reviews faster",
        body: "Customers scan, choose \"Great\" or \"Concern,\" and leave a review in minutes.",
      },
    ],
  },

  features: {
    id: "features",
    eyebrow: "Built for real businesses",
    title: "Everything you need to collect better reviews without the risk.",
    items: [
      {
        title: "Custom QR Templates",
        body: "Modern, print-ready designs that look like real marketing, not a QR on white.",
      },
      {
        title: "AI Review Assistant",
        body: "Helps customers draft a review from their input. Always editable, always their words.",
      },
      {
        title: "Concern Handling",
        body: "Let customers share concerns privately, while still allowing a public Google review if they choose.",
      },
      {
        title: "Insights Dashboard",
        body: "Track scans, drafts generated, Google redirects, and concern trends, so you know it's working.",
      },
    ],
    complianceNote:
      "RevsBoost suggests drafts based on customer input. Customers review, edit, and submit on Google themselves.",
  },

  insights: {
    id: "insights",
    eyebrow: "Insights",
    title: "Know what's working. Fix what isn't.",
    subtitle:
      "Turn every scan into a signal. Spot trends, understand customer sentiment, and improve your experience over time.",
    bullets: [
      {
        title: "Compare performance over time",
        body: "See scans, drafts, and redirect clicks week-to-week and month-to-month.",
      },
      {
        title: "Real-time engagement metrics",
        body: "Understand how customers move through your review flow, from scan to redirect.",
      },
      {
        title: "AI responses (coming soon)",
        body: "Draft professional replies for your reviews, fast and consistent.",
      },
      {
        title: "Smart alerts (coming soon)",
        body: "Get notified when concerns spike or engagement drops.",
      },
    ],
    disclaimer:
      "V1 insights are based on RevsBoost activity (scans, drafts, redirects). Google review ingestion can be added later.",
  },

  testimonials: {
    eyebrow: "Trusted by local businesses",
    title: "Simple to set up. Easy for customers. Clear results.",
    items: [
      {
        quote:
          "We went from occasional reviews to steady weekly feedback. The QR templates look legit, not cheap.",
        name: "Sarah M.",
        role: "Clinic Manager",
      },
      {
        quote:
          "Customers actually finish the review now. The draft helps them say what they mean without sounding robotic.",
        name: "David R.",
        role: "Restaurant Owner",
      },
      {
        quote:
          "The concern option is a huge win. People can share feedback calmly, and we still stay compliant.",
        name: "Nina K.",
        role: "Wellness Studio Owner",
      },
    ],
  },

  pricing: {
    id: "pricing",
    title: "Simple pricing. No surprises.",
    subtitle: "Choose the plan that fits your business. Upgrade anytime.",
    basic: {
      name: "Basic",
      price: "100",
      priceAnnual: "1,000",
      subtext: "per location / month",
      subtextAnnual: "per location / year (save 2 months)",
      description: "Everything you need to collect and manage Google reviews.",
      features: [
        "Custom QR templates (poster, counter card, sticker)",
        '"Great / Concern" review flow',
        "AI-assisted review draft (3 regenerations max)",
        "Real-time scan and redirect analytics",
        "Email alerts for customer concerns",
        "Unlimited review redirects",
      ],
      ctaLabel: "Get Started with Basic",
      ctaHref: "/signup",
    },
    pro: {
      name: "Pro",
      price: "150",
      priceAnnual: "1,500",
      subtext: "per location / month",
      subtextAnnual: "per location / year (save 2 months)",
      description: "For businesses that want automated review engagement.",
      features: [
        "Everything in Basic",
        "Automatic AI-generated review replies",
        "Priority support",
      ],
      ctaLabel: "Upgrade to Pro",
      ctaHref: "/signup",
      badge: "Most Popular",
    },
    comparisonNote:
      "Both plans include: Unlimited QR template downloads · Customers remain in control of posting · No contracts · Cancel anytime",
  },

  bookDemo: {
    id: "book-demo",
    title: "Book a demo",
    subtitle:
      "Pick a time that works for you. We'll walk you through RevsBoost and answer your questions.",
    ctaLabel: "Choose a time",
    /** Replace with your Cal.com booking link (e.g. cal.com/your-username/demo) */
    bookingUrl: "https://cal.com/revsboost/demo",
  },

  finalCta: {
    title: "Start collecting better reviews today.",
    subtitle:
      "Generate your first QR template and start turning real customer experiences into real social proof.",
    primary: { label: "Get Started Free", href: "/signup" },
    secondary: { label: "See Pricing", href: "/#pricing" },
  },

  footer: {
    columns: [
      {
        title: "Product",
        links: [
          { label: "How it works", href: "/how-it-works" },
          { label: "Features", href: "/features" },
          { label: "Insights", href: "/insights" },
          { label: "Pricing", href: "/pricing" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Articles", href: "/articles" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ],
      },
    ],
    bottomLine: "© " + new Date().getFullYear() + " RevsBoost. All rights reserved.",
  },
} as const;
