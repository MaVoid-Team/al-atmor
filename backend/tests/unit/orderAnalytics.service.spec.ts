import { orderAnalyticsService } from "../../services/orderAnalytics.service";
import { Order, OrderItem, Product, Category, ProductType } from "../../types";

describe("OrderAnalyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns aggregated metrics", async () => {
    jest.spyOn(Order, "findOne").mockResolvedValue({
      orderCount: "5",
      totalRevenue: "500.50",
      averageOrderValue: "100.10",
    } as any);

    jest.spyOn(OrderItem, "findOne").mockResolvedValue({ itemsSold: "12" } as any);
    jest.spyOn(Product, "count").mockResolvedValue(5);
    jest.spyOn(Category, "count").mockResolvedValue(6);
    jest.spyOn(ProductType, "count").mockResolvedValue(3);

    const summary = await orderAnalyticsService.getSummary({ period: "all" });

    expect(summary).toEqual({
      totalOrders: 5,
      totalRevenue: 500.5,
      averageOrderValue: 100.1,
      itemsSold: 12,
      totalProducts: 5,
      totalCategories: 6,
      totalProductTypes: 3,
    });
  });
});
