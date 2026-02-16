import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const essays = (await getCollection('essays', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  return rss({
    title: 'Jordan Lyall — Essays',
    description: 'Longer explorations of generative systems, AI agents, and sovereign infrastructure.',
    site: context.site!,
    items: essays.map((essay) => ({
      title: essay.data.title,
      description: essay.data.summary,
      pubDate: essay.data.publishDate,
      link: `/essays/${essay.id}/`,
      categories: [essay.data.topic],
    })),
  });
}
