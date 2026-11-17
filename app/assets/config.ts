export default {
  appTitle: "The Bike Challenge Club",
  appTitleShort: "The Bike Challenge",
  appDescription:
    "A cycling channel with videos about cycling, travel, and cycling-related content. Follow us for bikepacking adventures, gravel and more!",
  appThemeColor: "#ea9922",
  appBgColor: "#f7ede2",
  url: "https://thebikechallenge.cc",
  api: {
    globalOptions: "/acf/v3/options/options",
    homePage: "/wp/v2/pages?slug=home&_fields=id,slug,title,acf",
    offersPage: "/wp/v2/pages?slug=offers&_fields=id,slug,title,acf",
    blogPage: "/wp/v2/pages?slug=blog&_fields=id,slug,title,acf",
    eventPage: "/wp/v2/pages?slug=event&_fields=id,slug,title,acf",
    eventRsvp: "/api/event-rsvp",
  },
} as const;
