import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Textos explicativos da página de dúvidas, em Markdown. */
const duvidas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/duvidas' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
  }),
});

export const collections = { duvidas };
