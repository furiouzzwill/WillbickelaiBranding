/**
 * Registry of what the platform can create.
 *
 * Everything is declared up front so the Create Studio can show the full
 * product surface, but only entries with `available: true` are buildable.
 * The rest render as "Coming Soon" — visible intent, not a fake feature.
 *
 * Adding a creation type is a data change here plus a preset/spec builder,
 * never a new page.
 */

export type CreationCategory = "branding" | "streaming" | "content" | "business";

export type CreationEngine = "image" | "motion";

export type CreationType = {
  id: string;
  title: string;
  description: string;
  category: CreationCategory;
  engine: CreationEngine;
  /** Buildable today. Everything else is Coming Soon. */
  available: boolean;
  /** Default output aspect ratio. */
  aspectRatio: string;
  /** Whether the output needs an alpha channel (stream overlays do). */
  transparent?: boolean;
};

export const creationCategories: Record<
  CreationCategory,
  { title: string; description: string }
> = {
  branding: {
    title: "Branding",
    description: "Core identity assets that everything else is built from.",
  },
  streaming: {
    title: "Streaming",
    description: "Scenes, overlays, and alerts for live streams.",
  },
  content: {
    title: "Content Creation",
    description: "Intros, outros, and titles for video and podcasts.",
  },
  business: {
    title: "Business",
    description: "Promotions, announcements, and marketing assets.",
  },
};

export const creationTypes: CreationType[] = [
  // --- Branding -----------------------------------------------------------
  { id: "logo", title: "Logo", description: "A primary logo for your brand.", category: "branding", engine: "image", available: false, aspectRatio: "1:1", transparent: true },
  { id: "logo-variation", title: "Logo Variation", description: "An alternate lockup or mark.", category: "branding", engine: "image", available: false, aspectRatio: "1:1", transparent: true },
  { id: "brand-background", title: "Brand Background", description: "An on-brand background image.", category: "branding", engine: "image", available: false, aspectRatio: "16:9" },
  { id: "brand-pattern", title: "Brand Pattern", description: "A repeatable pattern in your style.", category: "branding", engine: "image", available: false, aspectRatio: "1:1" },
  { id: "profile-picture", title: "Profile Picture", description: "A square avatar for social platforms.", category: "branding", engine: "image", available: false, aspectRatio: "1:1" },
  { id: "banner", title: "Banner", description: "A channel or profile header.", category: "branding", engine: "image", available: false, aspectRatio: "16:9" },

  // --- Streaming ----------------------------------------------------------
  { id: "animated-logo-reveal", title: "Animated Logo Reveal", description: "Your logo, animated on brand.", category: "streaming", engine: "motion", available: false, aspectRatio: "16:9", transparent: true },
  { id: "starting-soon", title: "Starting Soon", description: "A pre-stream holding scene.", category: "streaming", engine: "motion", available: false, aspectRatio: "16:9" },
  { id: "brb", title: "BRB", description: "A be-right-back scene.", category: "streaming", engine: "motion", available: false, aspectRatio: "16:9" },
  { id: "stream-ending", title: "Stream Ending", description: "A sign-off scene.", category: "streaming", engine: "motion", available: false, aspectRatio: "16:9" },
  { id: "webcam-overlay", title: "Webcam Overlay", description: "A frame for your camera.", category: "streaming", engine: "motion", available: false, aspectRatio: "16:9", transparent: true },
  { id: "follower-alert", title: "New Follower Alert", description: "An alert for new followers.", category: "streaming", engine: "motion", available: false, aspectRatio: "16:9", transparent: true },
  { id: "subscriber-alert", title: "Subscriber Alert", description: "An alert for new subscribers.", category: "streaming", engine: "motion", available: false, aspectRatio: "16:9", transparent: true },
  { id: "donation-alert", title: "Donation Alert", description: "An alert for donations.", category: "streaming", engine: "motion", available: false, aspectRatio: "16:9", transparent: true },
  { id: "raid-alert", title: "Raid Alert", description: "An alert for incoming raids.", category: "streaming", engine: "motion", available: false, aspectRatio: "16:9", transparent: true },
  { id: "stream-transition", title: "Scene Transition", description: "A stinger between scenes.", category: "streaming", engine: "motion", available: false, aspectRatio: "16:9", transparent: true },

  // --- Content ------------------------------------------------------------
  { id: "youtube-intro", title: "YouTube Intro", description: "A branded video opener.", category: "content", engine: "motion", available: false, aspectRatio: "16:9" },
  { id: "youtube-outro", title: "YouTube Outro", description: "An end card with your links.", category: "content", engine: "motion", available: false, aspectRatio: "16:9" },
  { id: "subscribe-animation", title: "Subscribe Animation", description: "A subscribe prompt overlay.", category: "content", engine: "motion", available: false, aspectRatio: "16:9", transparent: true },
  { id: "lower-third", title: "Lower Third", description: "A name and title overlay.", category: "content", engine: "motion", available: false, aspectRatio: "16:9", transparent: true },
  { id: "title-card", title: "Title Card", description: "A full-frame title.", category: "content", engine: "motion", available: false, aspectRatio: "16:9" },
  { id: "reel-intro", title: "Reel Intro", description: "A vertical short-form opener.", category: "content", engine: "motion", available: false, aspectRatio: "9:16" },
  { id: "podcast-intro", title: "Podcast Intro", description: "An audio-led branded opener.", category: "content", engine: "motion", available: false, aspectRatio: "16:9" },
  { id: "social-handle", title: "Social Handle Animation", description: "An animated handle overlay.", category: "content", engine: "motion", available: false, aspectRatio: "16:9", transparent: true },

  // --- Business -----------------------------------------------------------
  { id: "logo-reveal-business", title: "Logo Reveal", description: "A polished logo animation.", category: "business", engine: "motion", available: false, aspectRatio: "16:9" },
  { id: "product-announcement", title: "Product Announcement", description: "Announce something new.", category: "business", engine: "motion", available: false, aspectRatio: "1:1" },
  { id: "sale-promotion", title: "Sale Promotion", description: "Promote an offer.", category: "business", engine: "motion", available: false, aspectRatio: "1:1" },
  { id: "event-announcement", title: "Event Announcement", description: "Announce an event.", category: "business", engine: "motion", available: false, aspectRatio: "1:1" },
  { id: "social-ad", title: "Social Advertisement", description: "A short branded ad.", category: "business", engine: "motion", available: false, aspectRatio: "9:16" },
  { id: "testimonial", title: "Testimonial", description: "A customer quote animation.", category: "business", engine: "motion", available: false, aspectRatio: "1:1" },
];

export function creationTypesByCategory(category: CreationCategory): CreationType[] {
  return creationTypes.filter((type) => type.category === category);
}

export function findCreationType(id: string): CreationType | undefined {
  return creationTypes.find((type) => type.id === id);
}
