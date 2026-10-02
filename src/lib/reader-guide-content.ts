export interface GuideLink { label: string; href: string; }
export interface GuideTopic { id: string; label: string; title: string; paragraphs: string[]; links: GuideLink[]; }
export interface ReaderGuideContent { pageTitle: string; topics: GuideTopic[]; }
