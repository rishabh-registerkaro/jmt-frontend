// UI strings that live in the components rather than the CMS (screen-reader
// labels, placeholders and the like). Page copy comes from the CMS.

export const UI_TEXT = {
  skipToContent: "Skip to content",
  nav: {
    main: "Main",
    mobile: "Mobile",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    home: "home",
    contactButton: "Contact",
  },
  opensWhatsApp: "(opens WhatsApp)",
  sites: {
    previous: "Previous sites",
    next: "Next sites",
    list: "Site types we staff",
  },
  faq: {
    tabs: "Questions by audience",
    questionsSuffix: "questions",
    eyebrow: "FAQs",
  },
  founder: {
    assurances: "What every crew comes with",
  },
  form: {
    honeypot: "Leave this field empty",
    resetIn: "This form will reset in {s}s",
    placeholders: {
      companyName: "e.g. ABC Infra",
      name: "Full name",
      phone: "+91",
      email: "name@company.com",
      siteLocation: "City or site name",
      headcount: "e.g. 12",
    },
    roles: {
      title: "Roles requested",
      edit: "Edit roles",
      add: "Choose roles",
      empty: "No roles picked yet. Tick the ones you need above, or just tell us on the call.",
      remove: "Remove {name}",
    },
  },
  process: {
    eyebrow: "How we work",
  },
  bar: {
    call: "Call",
    whatsapp: "WhatsApp",
    label: "Quick contact",
  },
};

export type UiText = typeof UI_TEXT;
