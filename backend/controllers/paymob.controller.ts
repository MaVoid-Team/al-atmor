import { Request, Response, NextFunction } from "express";
import { paymobService } from "../services/paymob.service";
import { orderService } from "../services/order.service";

export class PaymobController {
    /**
     * POST /webhooks/paymob
     * Handle Paymob payment webhook callbacks
     */
    handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload = req.body;
            const hmacHeader = req.query.hmac as string || req.headers["x-hmac"] as string;

            if (!hmacHeader) {
                console.error("[Paymob Webhook] Missing HMAC signature");
                return res.status(400).json({ error: "Missing HMAC signature" });
            }

            // Verify HMAC signature
            const isValid = paymobService.verifyHmacSignature(payload, hmacHeader);
            if (!isValid) {
                console.error("[Paymob Webhook] Invalid HMAC signature");
                return res.status(401).json({ error: "Invalid HMAC signature" });
            }

            // Extract order data from payload
            const orderData = paymobService.extractOrderData(payload);

            console.log("[Paymob Webhook] Received callback:", {
                transactionId: orderData.transactionId,
                orderId: orderData.orderId,
                success: orderData.success,
                pending: orderData.pending,
                amount: orderData.amountCents / 100,
            });

            // Only process successful non-pending transactions
            if (orderData.success && !orderData.pending) {
                // Extract checkout data from special_reference (base64 encoded JSON)
                const specialReference = payload.obj?.order?.merchant_order_id ||
                    payload.obj?.payment_key_claims?.extra?.merchant_order_id;

                let userId: number | null = null;
                let locationId: number | null = null;
                let addressId: number | undefined;
                let discountCode: string | undefined;

                // Try to decode special_reference
                if (specialReference && typeof specialReference === "string") {
                    try {
                        const decoded = Buffer.from(specialReference, "base64").toString("utf-8");
                        const checkoutData = JSON.parse(decoded);
                        userId = checkoutData.userId;
                        locationId = checkoutData.locationId;
                        addressId = checkoutData.addressId;
                        discountCode = checkoutData.discountCode;
                    } catch (decodeError) {
                        // Fallback to old format: user_{userId}_{timestamp}
                        const match = specialReference.match(/user_(\d+)_/);
                        if (match) {
                            userId = parseInt(match[1], 10);
                        }
                    }
                }

                if (!userId) {
                    // Fallback: try to get from payment_key_claims
                    userId = payload.obj?.payment_key_claims?.user_id;
                }

                if (!userId) {
                    console.error("[Paymob Webhook] Could not extract userId from payload");
                    return res.status(400).json({ error: "Missing user identification" });
                }

                if (!locationId) {
                    console.error("[Paymob Webhook] Could not extract locationId from payload");
                    return res.status(400).json({ error: "Missing location information" });
                }

                // Create the order from cart
                try {
                    const order = await orderService.checkout(userId, {
                        locationId,
                        addressId,
                        discountCode,
                    });

                    if (order && order.id) {
                        // Update order with payment metadata
                        await orderService.updateOrder(order.id, {
                            paymentStatus: "paid",
                            metadata: {
                                paymob: {
                                    transactionId: orderData.transactionId,
                                    paymobOrderId: orderData.orderId,
                                    amountCents: orderData.amountCents,
                                    currency: orderData.currency,
                                    sourceType: orderData.sourceType,
                                    processedAt: orderData.createdAt,
                                },
                            },
                        });

                        console.log("[Paymob Webhook] Order created successfully:", order.id);
                    }
                } catch (orderError: any) {
                    console.error("[Paymob Webhook] Failed to create order:", orderError.message);
                    // Don't return error to Paymob, just log it
                    // The payment was successful, we should acknowledge it
                }
            } else if (!orderData.success) {
                console.log("[Paymob Webhook] Payment failed or declined");
            } else if (orderData.pending) {
                console.log("[Paymob Webhook] Payment is pending");
            }

            // Always return 200 to acknowledge receipt
            return res.status(200).json({ received: true });
        } catch (err) {
            console.error("[Paymob Webhook] Error processing webhook:", err);
            // Return 200 anyway to prevent Paymob from retrying
            return res.status(200).json({ received: true, error: "Processing error" });
        }
    };

    /**
     * GET /webhooks/paymob/verify/:orderId
     * Verify payment status for a specific Paymob order
     */
    verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orderId = Number(req.params.orderId);

            if (!orderId) {
                return res.status(400).json({ error: "Order ID is required" });
            }

            const order = await orderService.getOrderById(orderId);

            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }

            return res.json({
                orderId: order.id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                total: order.total,
                currency: order.currency,
            });
        } catch (err) {
            next(err);
        }
    };
}

export const paymobController = new PaymobController();
