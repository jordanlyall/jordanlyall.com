import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  const essays = await getCollection('essays', ({ data }) => !data.draft);

  const allWriting = [
    ...notes.map((n) => ({ ...n, type: 'note' as const })),
    ...essays.map((e) => ({ ...e, type: 'essay' as const })),
  ].sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  return rss({
    title: 'Jordan Lyall — All Writing',
    description: 'Notes, essays, and research on generative systems, AI agents, and sovereign infrastructure.',
    site: context.site!,
    items: allWriting.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.publishDate,
      link: `/${post.type === 'note' ? 'notes' : 'essays'}/${post.id}/`,
      categories: [post.data.topic],
    })),
  });
}
