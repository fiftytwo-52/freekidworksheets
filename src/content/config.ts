import { defineCollection, z } from 'astro:content';

// Canonical values live in src/data/site.ts (MASTER-INSTRUCTION §8.4 / §11).
// The schema validates against them at build time via an async refine().

export const collections = {
    worksheets: defineCollection({
        type: 'content',
        schema: ({ image }) =>
            z
                .object({
                    title: z.string().min(3),
                    category: z.string(),
                    ageGroup: z.string(),
                    kind: z.enum(['worksheet', 'question']),
                    date: z.coerce.date(),
                    description: z.string().min(60).max(4000),
                    image: image(),
                    tags: z.array(z.string()).default([]),
                })
                .refine((d) => d.description.trim().length >= 60, {
                    message: 'description must be at least 60 characters of real copy',
                }),
    }),
};
