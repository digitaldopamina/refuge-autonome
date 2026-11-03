import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['preparation', 'equipement', 'habitat', 'sante', 'securite']),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(false),
    image: z.string().optional(),
    readingTime: z.number().optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),
  }),
});

export const collections = { articles };
