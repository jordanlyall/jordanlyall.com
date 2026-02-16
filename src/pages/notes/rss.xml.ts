import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const notes = (await getCollection('notes', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  return rss({
    title: 'Jordan Lyall — Notes',
    description: 'Short observations, research snippets, and experiment logs.',
    site: context.site!,
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.summary,
      pubDate: note.data.publishDate,
      link: `/notes/${note.id}/`,
      categories: [note.data.topic],
    })),
  });
}
