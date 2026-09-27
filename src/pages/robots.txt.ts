import type { APIRoute } from 'astro';
import { sitePath } from '../lib/urls';

export const GET: APIRoute = ({ site }) => {
  const text = import.meta.env.RELEASE_MODE === 'production'
    ? `User-agent: *\nAllow: /\nSitemap: ${new URL(sitePath('/sitemap-index.xml'), site)}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
