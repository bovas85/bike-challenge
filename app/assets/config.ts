export default {
  appTitle: "The Bike Challenge Club",
  appTitleShort: "The Bike Challenge",
  appDescription:
    "A cycling channel with videos about cycling, travel, and cycling-related content. Follow us for bikepacking adventures, gravel and more!",
  appThemeColor: "#ea9922",
  appBgColor: "#f7ede2",
  url: "https://thebikechallenge.cc",
  wpUrl: "https://bike.moustachedesign.fyi",
  wpApiBase: "https://bike.moustachedesign.fyi/wp-json",
  api: {
    globalOptions: "/acf/v3/options/options?_fields=acf",
    homePage:
      "/wp/v2/pages?slug=home&_fields=id,slug,title,acf&acf_format=standard",
    offersPage:
      "/wp/v2/pages?slug=offers&_fields=id,slug,title,acf&acf_format=standard",
    blogPage:
      "/wp/v2/pages?slug=blog&_fields=id,slug,title,acf&acf_format=standard",
    eventPage:
      "/wp/v2/pages?slug=event&_fields=id,slug,title,acf&acf_format=standard",
    eventRsvp: "/api/event-rsvp",
  },
} as const;
