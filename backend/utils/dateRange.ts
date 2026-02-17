export type DatePeriod = "day" | "month" | "year" | "range" | "all";

export interface DateRangeResult {
  start?: Date;
  end?: Date;
}

const parseDate = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? undefined : parsed;
};

const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addYears = (date: Date, years: number) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

export const buildDateRange = (
  period: DatePeriod = "all",
  options: { date?: string; startDate?: string; endDate?: string } = {}
): DateRangeResult => {
  if (period === "all") {
    return {};
  }

  if (period === "range") {
    const start = parseDate(options.startDate);
    const end = parseDate(options.endDate);
    if (!start || !end) {
      throw new Error("Invalid startDate or endDate for custom range");
    }
    if (start > end) {
      throw new Error("startDate must be before endDate");
    }
    const endAdjusted = new Date(end);
    endAdjusted.setDate(endAdjusted.getDate() + 1);
    return { start, end: endAdjusted };
  }

  const baseDate = parseDate(options.date) || new Date();
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  if (period === "day") {
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (period === "month") {
    start.setDate(1);
    const end = addMonths(start, 1);
    return { start, end };
  }

  if (period === "year") {
    start.setMonth(0, 1);
    const end = addYears(start, 1);
    return { start, end };
  }

  throw new Error("Unsupported period");
};
