import crypto from "crypto";

interface PaymobItem {
    name: string;
    amount: number;
    description: string;
    quantity: number;
}

interface BillingData {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    apartment?: string;
    street?: string;
    building?: string;
    city?: string;
    country?: string;
    floor?: string;
    state?: string;
}

interface PaymentIntentionRequest {
    amount: number;
    currency: string;
    items: PaymobItem[];
    billing_data: BillingData;
    special_reference?: string;
    notification_url?: string;
    redirection_url?: string;
}

interface PaymentIntentionResponse {
    id: string;
    client_secret: string;
    intention_order_id: number;
    payment_keys: Array<{
        integration: number;
        key: string;
        order_id: number;
    }>;
    status: string;
}

interface PaymobWebhookPayload {
    type: string;
    obj: {
        id: number;
        pending: boolean;
        amount_cents: number;
        success: boolean;
        is_auth: boolean;
        is_capture: boolean;
        is_standalone_payment: boolean;
        is_voided: boolean;
        is_refunded: boolean;
        is_3d_secure: boolean;
        integration_id: number;
        has_parent_transaction: boolean;
        order: {
            id: number;
            created_at: string;
            delivery_needed: boolean;
            merchant: { id: number };
            amount_cents: number;
            shipping_data?: any;
            currency: string;
            is_payment_locked: boolean;
            paid_amount_cents: number;
            items: any[];
        };
        created_at: string;
        transaction_processed_callback_responses: any[];
        currency: string;
        source_data: {
            type: string;
            pan?: string;
            sub_type?: string;
        };
        api_source: string;
        terminal_id?: number;
        merchant_commission: number;
        installment?: any;
        is_void: boolean;
        is_refund: boolean;
        data: {
            gateway_integration_pk?: number;
            klass?: string;
            created_at?: string;
            amount?: number;
            currency?: string;
            migs_order?: any;
            merchant?: string;
            migs_result?: string;
            migs_transaction?: any;
            txn_response_code?: string;
            acq_response_code?: string;
            message?: string;
            merchant_txn_ref?: string;
            order_info?: string;
            receipt_no?: string;
            transaction_no?: string;
            batch_no?: number;
            authorize_id?: string;
            card_type?: string;
            card_num?: string;
            secure_hash?: string;
            avs_result_code?: string;
            avs_acq_response_code?: string;
            captured_amount?: number;
            authorised_amount?: number;
            refunded_amount?: number;
        };
        is_hidden: boolean;
        payment_key_claims: {
            user_id: number;
            amount_cents: number;
            currency: string;
            integration_id: number;
            order_id: number;
            billing_data: BillingData;
            lock_order_when_paid: boolean;
            extra: any;
            single_payment_attempt: boolean;
            exp: number;
            pmk_ip: string;
        };
        error_occured: boolean;
        is_live: boolean;
        other_endpoint_reference?: string;
        refunded_amount_cents: number;
        source_id: number;
        is_captured: boolean;
        captured_amount: number;
        merchant_staff_tag?: string;
        owner: number;
        parent_transaction?: number;
    };
}

const PAYMOB_API_URL = "https://accept.paymob.com";

export class PaymobService {
    private secretKey: string;
    private publicKey: string;
    private integrationId: number;
    private hmacSecret: string;

    constructor() {
        this.secretKey = process.env.PAYMOB_SECRET_KEY || "";
        this.publicKey = process.env.PAYMOB_PUBLIC_KEY || "";
        this.integrationId = parseInt(process.env.PAYMOB_INTEGRATION_ID || "0", 10);
        this.hmacSecret = process.env.PAYMOB_HMAC_SECRET || "";
    }

    private validateConfig() {
        if (!this.secretKey) throw new Error("PAYMOB_SECRET_KEY is not configured");
        if (!this.publicKey) throw new Error("PAYMOB_PUBLIC_KEY is not configured");
        if (!this.integrationId) throw new Error("PAYMOB_INTEGRATION_ID is not configured");
        if (!this.hmacSecret) throw new Error("PAYMOB_HMAC_SECRET is not configured");
    }

    /**
     * Create a payment intention with Paymob
     */
    async createPaymentIntention(
        data: PaymentIntentionRequest
    ): Promise<PaymentIntentionResponse> {
        this.validateConfig();
        const requestBody = {
            amount: data.amount,
            currency: data.currency,
            payment_methods: [this.integrationId],
            items: data.items,
            billing_data: {
                apartment: data.billing_data.apartment || "NA",
                first_name: data.billing_data.first_name,
                last_name: data.billing_data.last_name,
                street: data.billing_data.street || "NA",
                building: data.billing_data.building || "NA",
                phone_number: data.billing_data.phone_number,
                city: data.billing_data.city || "NA",
                country: data.billing_data.country || "Saudi Arabia",
                email: data.billing_data.email,
                floor: data.billing_data.floor || "NA",
                state: data.billing_data.state || "NA",
            },
            special_reference: data.special_reference,
            notification_url: data.notification_url,
            redirection_url: data.redirection_url,
        };

        const response = await fetch(`${PAYMOB_API_URL}/v1/intention/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${this.secretKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Paymob API error: ${response.status} - ${errorText}`);
        }

        return response.json();
    }

    /**
     * Generate the Paymob checkout URL
     */
    generateCheckoutUrl(clientSecret: string): string {
        return `${PAYMOB_API_URL}/unifiedcheckout/?publicKey=${this.publicKey}&clientSecret=${clientSecret}`;
    }

    /**
     * Verify HMAC signature from Paymob webhook
     * Based on Paymob's callback signature verification
     */
    verifyHmacSignature(payload: PaymobWebhookPayload, hmacHeader: string): boolean {
        const obj = payload.obj;

        // Paymob HMAC calculation order (alphabetically sorted keys)
        const concatenatedString = [
            obj.amount_cents,
            obj.created_at,
            obj.currency,
            obj.error_occured,
            obj.has_parent_transaction,
            obj.id,
            obj.integration_id,
            obj.is_3d_secure,
            obj.is_auth,
            obj.is_capture,
            obj.is_refunded,
            obj.is_standalone_payment,
            obj.is_voided,
            obj.order.id,
            obj.owner,
            obj.pending,
            obj.source_data.pan || "",
            obj.source_data.sub_type || "",
            obj.source_data.type,
            obj.success,
        ].join("");

        const calculatedHmac = crypto
            .createHmac("sha512", this.hmacSecret)
            .update(concatenatedString)
            .digest("hex");

        return calculatedHmac === hmacHeader;
    }

    /**
     * Extract order data from webhook payload
     */
    extractOrderData(payload: PaymobWebhookPayload) {
        const obj = payload.obj;
        return {
            transactionId: obj.id,
            orderId: obj.order.id,
            success: obj.success,
            pending: obj.pending,
            amountCents: obj.amount_cents,
            currency: obj.currency,
            isRefunded: obj.is_refunded,
            isVoided: obj.is_voided,
            sourceType: obj.source_data.type,
            createdAt: obj.created_at,
            billingData: obj.payment_key_claims?.billing_data,
        };
    }
}

export const paymobService = new PaymobService();
