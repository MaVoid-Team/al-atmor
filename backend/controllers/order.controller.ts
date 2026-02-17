import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";

export class OrderController {
  /**
   * GET /orders
   * List orders for the authenticated user
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const status = req.query.status as string | undefined;
      const period = req.query.period as string | undefined;
      const date = req.query.date as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const result = await orderService.listOrders(page, limit, {
        userId,
        status,
        period: period as any,
        date,
        startDate,
        endDate,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /orders/:id
   * Get a single order belonging to the authenticated user
   */
  detail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const id = Number(req.params.id);

      const order = await orderService.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if ((order as any).userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(order);
    } catch (err) {
      next(err);
    }
  };
}

export const orderController = new OrderController();
