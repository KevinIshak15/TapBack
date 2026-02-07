import { z } from 'zod';
import { insertUserSchema, insertBusinessSchema, insertReviewSchema, businesses, reviews, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: insertUserSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  businesses: {
    create: {
      method: 'POST' as const,
      path: '/api/businesses' as const,
      input: insertBusinessSchema,
      responses: {
        201: z.custom<typeof businesses.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/businesses' as const,
      responses: {
        200: z.array(z.custom<typeof businesses.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/businesses/:id' as const,
      responses: {
        200: z.custom<typeof businesses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    getBySlug: {
      method: 'GET' as const,
      path: '/api/businesses/slug/:slug' as const,
      responses: {
        200: z.custom<typeof businesses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/businesses/:id' as const,
      input: insertBusinessSchema.partial().extend({ focusAreas: z.array(z.string()).optional() }),
      responses: {
        200: z.custom<typeof businesses.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    getStats: { // For insights
      method: 'GET' as const,
      path: '/api/businesses/:id/stats' as const,
      responses: {
        200: z.object({
          scans: z.number(),
          reviewsGenerated: z.number(),
          redirects: z.number(),
          concerns: z.number(),
        }),
        404: errorSchemas.notFound,
      },
    }
  },
  reviews: {
    create: {
      method: 'POST' as const,
      path: '/api/reviews' as const,
      input: insertReviewSchema,
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    generateAI: {
      method: 'POST' as const,
      path: '/api/generate-review' as const,
      input: z.object({
        businessId: z.number(),
        tags: z.array(z.string()),
        experienceType: z.string(),
        customText: z.string().optional(),
      }),
      responses: {
        200: z.object({ review: z.string() }),
        400: errorSchemas.validation,
        429: z.object({ message: z.string() }), // Rate limit for regeneration
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
