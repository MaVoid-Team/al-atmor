import { fn, col, literal, Op } from "sequelize";
import { Order, OrderItem, Product, Category, ProductType } from "../types";
import { buildDateRange, DatePeriod } from "../utils/dateRange";

interface AnalyticsFilters {
  period?: DatePeriod;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export class OrderAnalyticsService {
  async getSummary(filters: AnalyticsFilters = {}) {
    const where: any = {};
    if (filters.period && filters.period !== "all") {
      const range = buildDateRange(filters.period, {
        date: filters.date,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      if (range.start && range.end) {
        where.placedAt = {
          [Op.between]: [range.start, range.end],
        };
      }
    }

    const [
      summary,
      itemSum,
      totalProducts,
      totalCategories,
      totalProductTypes,
    ] = await Promise.all([
      Order.findOne({
        attributes: [
          [fn("COUNT", col("Order.id")), "orderCount"],
          [
            fn("COALESCE", fn("SUM", col("Order.total")), literal("0")),
            "totalRevenue",
          ],
          [
            fn("COALESCE", fn("AVG", col("Order.total")), literal("0")),
            "averageOrderValue",
          ],
        ],
        where,
        raw: true,
      }),
      OrderItem.findOne({
        attributes: [
          [
            fn("COALESCE", fn("SUM", col("quantity")), literal("0")),
            "itemsSold",
          ],
        ],
        include: [
          {
            model: Order,
            as: "order",
            attributes: [],
            where,
            required: true,
          },
        ],
        raw: true,
      }),
      Product.count(),
      Category.count(),
      ProductType.count(),
    ]);

    return {
      totalOrders: Number((summary as any)?.orderCount || 0),
      totalRevenue: Number((summary as any)?.totalRevenue || 0),
      averageOrderValue: Number((summary as any)?.averageOrderValue || 0),
      itemsSold: Number((itemSum as any)?.itemsSold || 0),
      totalProducts,
      totalCategories,
      totalProductTypes,
    };
  }
}

export const orderAnalyticsService = new OrderAnalyticsService();
