export const topics = {
  'generative-art': {
    name: 'Generative Art & Digital Culture',
    thesis: 'Generative systems create art through code, algorithms, and onchain infrastructure. The intersection of computation and culture is producing new creative primitives -- from long-form generative art to autonomous creative agents. This is where art meets protocol.',
    relatedTopics: ['ai-agents', 'sovereign-systems'],
  },
  'ai-agents': {
    name: 'AI Agents & Infrastructure',
    thesis: 'AI agents are becoming primary actors on the web -- reading, summarizing, negotiating, and transacting on our behalf. Building the infrastructure for this shift means rethinking how we expose capabilities, structure data, and design for machine legibility.',
    relatedTopics: ['sovereign-systems', 'generative-art'],
  },
  'sovereign-systems': {
    name: 'Sovereign Systems',
    thesis: 'Personal infrastructure that you own and control. From identity to publishing to coordination, sovereign systems prioritize durability, composability, and independence from platform lock-in. Your domain is your identity root.',
    relatedTopics: ['ai-agents', 'generative-art'],
  },
} as const;

export type TopicSlug = keyof typeof topics;
