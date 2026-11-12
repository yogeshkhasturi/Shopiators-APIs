import { z } from 'zod';

const MAX_RANGE_DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const SalesAnalyticsQuerySchema = z
  .object({
    startDate: z
      .string()
      .refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid startDate')
      .optional(),
    endDate: z
      .string()
      .refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid endDate')
      .optional(),
  })
  .transform((data) => {
    const end = data.endDate ? new Date(data.endDate) : new Date();
    const start = data.startDate
      ? new Date(data.startDate)
      : new Date(end.getTime() - 30 * MS_PER_DAY);
    return { startDate: start, endDate: end };
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'startDate must be less than or equal to endDate',
    path: ['startDate'],
  })
  .refine(
    (data) => data.endDate.getTime() - data.startDate.getTime() <= MAX_RANGE_DAYS * MS_PER_DAY,
    {
      message: `Date range cannot exceed ${MAX_RANGE_DAYS} days`,
      path: ['endDate'],
    }
  );

export type SalesAnalyticsQuery = z.infer<typeof SalesAnalyticsQuerySchema>;

