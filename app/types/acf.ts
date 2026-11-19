export interface AcfImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface NavLinkItem {
  label: string;
  to: string;
  external?: boolean;
}

export interface SocialLinkItem {
  name: "strava" | "instagram" | "tiktok" | "youtube";
  label: string;
  url: string;
  iconUrl?: string;
}

export interface SiteGlobalACF {
  brandTitle: string;
  logoUrl: string;
  email: string;
  blogEmail: string;
  copyright: string;
  heroNavLinks: NavLinkItem[];
  socialLinks: SocialLinkItem[];
}

export interface AdventureCardACF {
  id: string;
  platform: "komoot" | "strava";
  title: string;
  url: string;
}

export interface BlogArticleACF {
  id: string;
  title: string;
  excerpt: string;
  readTime?: string;
  image: AcfImage;
  url: string;
  ctaLabel: string;
  featuredOnHome?: boolean;
}

export interface PartnerLogoACF {
  id: string;
  name: string;
  logoUrl: string;
  url: string;
}

export interface HomePageACF {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: AcfImage;
    scrollDownText: string;
  };
  joinJourney: {
    heading: string;
    body: string;
  };
  quote: {
    text: string;
    author: string;
    ctaLabel: string;
    ctaUrl: string;
  };
  viewFromBars: {
    heading: string;
    body: string;
    ctaLabel: string;
    ctaUrl: string;
    carouselImages: AcfImage[];
  };
  adventures: AdventureCardACF[];
  videoSpotlight: {
    heading: string;
    body: string;
    ctaLabel: string;
    ctaUrl: string;
    youtubeId: string;
    thumbnailUrl: string;
  };
  blogPreview: {
    heading: string;
    subtitle: string;
    ctaLabel: string;
    ctaTo: string;
  };
  campsitesMap: {
    heading: string;
    embedUrl: string;
  };
  partnersSection: {
    heading: string;
    ctaLabel: string;
    ctaTo: string;
    logos: PartnerLogoACF[];
  };
}

export interface OfferCardACF {
  id: string;
  brand: string;
  discountBadge: string;
  description: string;
  code: string;
  codeUrl?: string;
  url: string;
  image: AcfImage;
  overlayLogoUrl?: string;
}

export interface OfferFilterCriteria {
  brandQuery: string;
  discountPercent: number | null;
}

export interface OffersPageACF {
  brandHeader: string;
  subtitle: string;
  offers: OfferCardACF[];
  disclosureNote: string;
}

export interface BlogPageACF {
  brandHeader: string;
  heading: string;
  subtitle: string;
  articles: BlogArticleACF[];
}

export interface EventDetailItemACF {
  icon: string;
  label: string;
  value: string;
}

export interface EventPageACF {
  brandHeader: string;
  title: string;
  paragraphs: string[];
  details: EventDetailItemACF[];
  closingNote: string;
  posterImage: AcfImage;
  form: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitLabel: string;
    successMessage: string;
  };
}

export interface SiteContentBundle {
  global: SiteGlobalACF;
  home: HomePageACF;
  offers: OffersPageACF;
  blog: BlogPageACF;
  event: EventPageACF;
}

export interface WpPageResponse<T> {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  acf: T;
}
