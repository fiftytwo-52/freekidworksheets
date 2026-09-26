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
                    code: z.string().regex(/^\d{4,5}$/),
                    category: z.string(),
                    ageGroup: z.string(),
                    date: z.coerce.date(),
                    description: z.string().min(60).max(4000),
                    /** Unique 140-160 char meta description (SEO TASK-11). */
                    metaDescription: z.string().min(120).max(200).optional(),
                    /** Compact unique title used for <title>/OG (SEO TASK-07/11). */
                    shortTitle: z.string().min(10).max(60).optional(),
                    /** Unique "About this worksheet" copy (SEO TASK-06). */
                    about: z.string().min(120).max(700).optional(),
                    image: image(),
                    tags: z.array(z.string()).default([]),
                    language: z.enum(['en', 'ne', 'es', 'pt']).default('en'),
                    colorType: z.enum(['black-and-white', 'colorful']).default('black-and-white'),
                })
                .refine((d) => d.description.trim().length >= 60, {
                    message: 'description must be at least 60 characters of real copy',
                }),
    }),
};
