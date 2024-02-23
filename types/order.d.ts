export interface Order {
    order_no: string;
    identifier: string;
    created_at: string;
    user_email: string;
    expired_at: string;
    order_status: string;
    paied_at?: string;
    credits: number,
    used_credits: number,
    customer_id: number,
    variant_id: number,
}
