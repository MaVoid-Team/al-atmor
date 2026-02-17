import { AdminUserService } from "../../services/adminUser.service";
import { User } from "../../types";
import { BaseService } from "../../services/base.service";

describe("AdminUserService", () => {
  let service: AdminUserService;

  beforeEach(() => {
    service = new AdminUserService();
    jest.clearAllMocks();
  });

  describe("getPaginatedUsers", () => {
    it("should strip password field", async () => {
      jest.spyOn(BaseService.prototype, "getAll").mockResolvedValue({
        data: [
          {
            get: jest.fn().mockReturnValue({
              id: 1,
              email: "admin@example.com",
              password: "secret",
              role: "admin",
              firstName: "Ada",
              lastName: "Lovelace",
            }),
          } as any,
        ],
        meta: { totalItems: 1, totalPages: 1, currentPage: 1, itemsPerPage: 10 },
      });

      const result = await service.getPaginatedUsers(1, 10);

      expect(result.data[0]).toEqual({
        id: 1,
        email: "admin@example.com",
        role: "admin",
        firstName: "Ada",
        lastName: "Lovelace",
      });
    });
  });

  describe("getUserById", () => {
    it("should return sanitized user", async () => {
      const accountCreatedAt = new Date("2024-01-01T00:00:00.000Z");
      const orderPlacedAt = new Date("2024-02-01T00:00:00.000Z");
      const addressCreatedAt = new Date("2024-01-05T00:00:00.000Z");
      const addressUpdatedAt = new Date("2024-01-06T00:00:00.000Z");

      jest.spyOn(User, "findByPk").mockResolvedValue({
        get: jest.fn().mockReturnValue({
          id: 2,
          email: "user@example.com",
          role: "customer",
          password: "hash",
          firstName: "John",
          lastName: "Doe",
          createdAt: accountCreatedAt,
          addresses: [
            {
              id: 10,
              recipientName: "John Doe",
              streetAddress: "123 Main St",
              district: "Central",
              postalCode: "12345",
              city: "Riyadh",
              buildingNumber: "12",
              secondaryNumber: "34",
              phoneNumber: "+966500000000",
              isDefault: true,
              label: "Home",
              createdAt: addressCreatedAt,
              updatedAt: addressUpdatedAt,
            },
          ],
          orders: [
            {
              id: 99,
              status: "pending",
              paymentStatus: "unpaid",
              subtotal: "100.00",
              tax: "10.00",
              total: "110.00",
              currency: "SAR",
              placedAt: orderPlacedAt,
              createdAt: orderPlacedAt,
              updatedAt: orderPlacedAt,
              items: [
                {
                  id: 55,
                  productId: 7,
                  quantity: 2,
                  priceAtPurchase: "55.00",
                  Product: {
                    id: 7,
                    name: "Cooling Kit",
                    sku: "COOL-1",
                    price: "55.00",
                  },
                },
              ],
            },
          ],
        }),
      } as any);

      const result = await service.getUserById(2);
      expect(result).toEqual({
        id: 2,
        email: "user@example.com",
        role: "customer",
        firstName: "John",
        lastName: "Doe",
        createdAt: accountCreatedAt,
        addresses: [
          {
            id: 10,
            recipientName: "John Doe",
            streetAddress: "123 Main St",
            district: "Central",
            postalCode: "12345",
            city: "Riyadh",
            buildingNumber: "12",
            secondaryNumber: "34",
            phoneNumber: "+966500000000",
            isDefault: true,
            label: "Home",
            createdAt: addressCreatedAt,
            updatedAt: addressUpdatedAt,
          },
        ],
        orders: [
          {
            id: 99,
            status: "pending",
            paymentStatus: "unpaid",
            subtotal: 100,
            tax: 10,
            total: 110,
            currency: "SAR",
            placedAt: orderPlacedAt,
            createdAt: orderPlacedAt,
            updatedAt: orderPlacedAt,
            items: [
              {
                id: 55,
                productId: 7,
                quantity: 2,
                priceAtPurchase: 55,
                product: {
                  id: 7,
                  name: "Cooling Kit",
                  sku: "COOL-1",
                  price: 55,
                },
              },
            ],
          },
        ],
        orderStats: {
          totalOrders: 1,
          totalItems: 2,
          totalSpent: 110,
          lastOrderDate: orderPlacedAt,
        },
        accountCreatedAt,
      });
    });
  });

  describe("updateUser", () => {
    it("should return null when user does not exist", async () => {
      jest.spyOn(User, "findByPk").mockResolvedValue(null);
      const result = await service.updateUser(999, { role: "admin" } as any);
      expect(result).toBeNull();
    });

    it("should update and sanitize user", async () => {
      const mockUpdate = jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue({
          id: 3,
          email: "test",
          role: "admin",
          firstName: "Test",
          lastName: "User",
        }),
      });
      jest.spyOn(User, "findByPk").mockResolvedValue({ update: mockUpdate } as any);

      const result = await service.updateUser(3, { role: "admin" } as any);
      expect(result).toEqual({
        id: 3,
        email: "test",
        role: "admin",
        firstName: "Test",
        lastName: "User",
      });
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
