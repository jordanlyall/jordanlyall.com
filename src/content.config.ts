import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().describe('1-2 sentence "Why this matters"'),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    topic: z.enum(['generative-art', 'ai-agents', 'sovereign-systems']),
    secondaryTopic: z.enum(['generative-art', 'ai-agents', 'sovereign-systems']).optional(),
    related: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    syndicatedOn: z.array(z.object({
      platform: z.string(),
      url: z.string().url(),
    })).default([]),
  }),
});

const essays = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().describe('1-2 sentence "Why this matters"'),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    topic: z.enum(['generative-art', 'ai-agents', 'sovereign-systems']),
    secondaryTopic: z.enum(['generative-art', 'ai-agents', 'sovereign-systems']).optional(),
    related: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    references: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
    })).default([]),
    syndicatedOn: z.array(z.object({
      platform: z.string(),
      url: z.string().url(),
    })).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().describe('One-line description of what it does'),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    stack: z.array(z.string()).default([]),
    topic: z.enum(['generative-art', 'ai-agents', 'sovereign-systems']),
    status: z.enum(['active', 'shipped', 'archived']).default('active'),
    year: z.number(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { notes, essays, projects };
