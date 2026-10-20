/**
 * Real social-proof content. Intentionally EMPTY: nothing here may be invented.
 * Sections that use these lists are hidden until real entries are added — only add items that
 * come from real customers who agreed to be featured.
 */

export interface Testimonial {
  /** Customer's own words */
  quote: string;
  /** Name or initials the customer agreed to show */
  author: string;
  /** Optional, e.g. "Sơn gel" */
  service?: string;
}

export interface BeforeAfterItem {
  beforeUrl: string;
  afterUrl: string;
  caption?: string;
}


export const testimonials: Testimonial[] = [];


export const beforeAfter: BeforeAfterItem[] = [];
