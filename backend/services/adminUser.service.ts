import { BaseService } from "./base.service";
import { User, Order, OrderItem, Product, UserAddress } from "../types";

export interface SanitizedUser {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SanitizedAddress {
  id: number;
  recipientName: string;
  streetAddress: string;
  district: string;
  postalCode: string;
  city: string;
  buildingNumber?: string | null;
  secondaryNumber?: string | null;
  phoneNumber?: string | null;
  isDefault: boolean;
  label?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SanitizedOrderItem {
  id: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  product: {
    id: number;
    name: string;
    sku: string;
    price: number;
  } | null;
}

interface SanitizedOrder {
  id: number;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  placedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  items: SanitizedOrderItem[];
}

interface UserOrderStats {
  totalOrders: number;
  totalItems: number;
  totalSpent: number;
  lastOrderDate: Date | null;
}

export type DetailedUser = SanitizedUser & {
  addresses: SanitizedAddress[];
  orders: SanitizedOrder[];
  orderStats: UserOrderStats;
  accountCreatedAt: Date | null;
};

export class AdminUserService extends BaseService<User> {
  constructor() {
    super(User);
  }

  private sanitizeBasic(user: User | null): SanitizedUser | null {
    if (!user) return null;
    const plain = user.get({ plain: true }) as any;
    const { password, ...rest } = plain;
    return rest as SanitizedUser;
  }

  private sanitizeDetailed(user: User | null): DetailedUser | null {
    if (!user) return null;

    const base = this.sanitizeBasic(user);
    if (!base) return null;

    const plain = user.get({ plain: true }) as any;

    const addresses: SanitizedAddress[] = (plain.addresses || []).map(
      (address: UserAddress | any) => ({
        id: address.id,
        recipientName: address.recipientName,
        streetAddress: address.streetAddress,
        district: address.district,
        postalCode: address.postalCode,
        city: address.city,
        buildingNumber: address.buildingNumber,
        secondaryNumber: address.secondaryNumber,
        phoneNumber: address.phoneNumber,
        isDefault: address.isDefault,
        label: address.label,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      })
    );

    const orders: SanitizedOrder[] = (plain.orders || [])
      .map((order: Order | any) => {
        const items: SanitizedOrderItem[] = (order.items || []).map(
          (item: OrderItem | any) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: Number(item.priceAtPurchase || 0),
            product: item.Product
              ? {
                  id: (item.Product as Product).id,
                  name: (item.Product as Product).name,
                  sku: (item.Product as Product).sku,
                  price: Number((item.Product as Product).price || 0),
                }
              : null,
          })
        );

        return {
          id: order.id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          subtotal: Number(order.subtotal || 0),
          tax: Number(order.tax || 0),
          total: Number(order.total || 0),
          currency: order.currency,
          placedAt: order.placedAt || null,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items,
        };
      })
      .sort((a: SanitizedOrder, b: SanitizedOrder) => {
        const aTime = a.placedAt ? new Date(a.placedAt).getTime() : 0;
        const bTime = b.placedAt ? new Date(b.placedAt).getTime() : 0;
        return bTime - aTime;
      });

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const totalItems = orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    addresses.sort((a, b) => {
      if (a.isDefault === b.isDefault) {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }
      return a.isDefault ? -1 : 1;
    });

    const orderStats: UserOrderStats = {
      totalOrders: orders.length,
      totalItems,
      totalSpent,
      lastOrderDate: orders.length ? orders[0].placedAt : null,
    };

    return {
      ...base,
      addresses,
      orders,
      orderStats,
      accountCreatedAt: plain.createdAt || null,
    } as DetailedUser;
  }

  async getPaginatedUsers(page: number, limit: number) {
    const result = await super.getAll(page, limit, {
      attributes: { exclude: ["password"] },
      order: [["id", "DESC"]],
    });

    return {
      data: result.data
        .map((user: any) => this.sanitizeBasic(user))
        .filter(Boolean),
      meta: result.meta,
    };
  }

  async getUserById(id: number) {
    const user = await this.model.findByPk(id, {
      include: [
        {
          model: UserAddress,
          as: "addresses",
        },
        {
          model: Order,
          as: "orders",
          include: [
            {
              model: OrderItem,
              as: "items",
              include: [
                {
                  model: Product,
                  attributes: ["id", "name", "sku", "price"],
                },
              ],
            },
          ],
        },
      ],
    });
    return this.sanitizeDetailed(user);
  }

  async createUser(data: Partial<User>) {
    const user = await this.model.create(data as any);
    return this.sanitizeBasic(user);
  }

  async updateUser(id: number, data: Partial<User>) {
    const user = await this.model.findByPk(id);
    if (!user) return null;
    const updated = await user.update(data as any);
    return this.sanitizeBasic(updated);
  }

  async deleteUser(id: number) {
    return this.delete(id);
  }
}

export const adminUserService = new AdminUserService();
