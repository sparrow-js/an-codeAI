import { Order } from "@/types/order";
import { QueryResultRow } from "pg";
import { getDb } from "@/models/db";

export async function insertOrder(order: Order) {
  const db = getDb();
  const res = await db.query(
    `INSERT INTO orders 
        (
            order_no,
            identifier,
            created_at,
            user_email,
            expired_at,
            order_status,
            paied_at,
            credits,
            used_credits,
            customer_id,
            variant_id
        ) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `,
    [
      order.order_no,
      order.identifier,
      order.created_at,
      order.user_email,
      order.expired_at,
      order.order_status,
      order.paied_at,
      order.credits,
      order.used_credits,
      order.customer_id,
      order.variant_id,
    ]
  );

  return res;
}

export async function findOrderByOrderNo(
    order_no: number
  ): Promise<Order | undefined> {
    const db = getDb();
    const res = await db.query(
      `SELECT * FROM orders WHERE order_no = $1 LIMIT 1`,
      [order_no]
    );
    if (res.rowCount === 0) {
      return undefined;
    }
  
    const { rows } = res;
    const row = rows[0] as Order;
    return row;
}

export async function findOrderByIdentifier(
    identifier: string
  ): Promise<Order | undefined> {
    const db = getDb();
    const res = await db.query(
      `SELECT * FROM orders WHERE identifier = $1 LIMIT 1`,
      [identifier]
    );
    if (res.rowCount === 0) {
      return undefined;
    }
  
    const { rows } = res;
    const row = rows[0] as Order;
    return row;
}



export async function getUserOrders(
    user_email: string
  ): Promise<Order[] | undefined> {
    const now = new Date().toISOString();
    const db = getDb();
    const res = await db.query(
      `SELECT * FROM orders WHERE user_email = $1 AND order_status = $3 AND expired_at >= $2 AND credits > used_credits`,
      [user_email, now, 'paid']
    );
    if (res.rowCount === 0) {
      return undefined;
    }
    const { rows } = res;
  
    return rows as Order[];
}

export async function getUserOrdersAsc(user_email: string): Promise<Order | undefined>  {
    const now = new Date().toISOString();
    const db = getDb();
    const res = await db.query(
      `SELECT * FROM orders WHERE user_email = $1 AND order_status = $3 AND expired_at >= $2 AND credits > used_credits order by created_at asc LIMIT 1`,
      [user_email, now, 'paid']
    );
    if (res.rowCount === 0) {
      return undefined;
    }
  
    const { rows } = res;
    const row = rows[0] as Order;
    return row as Order;
}

export async function updateOrderUsedCredits(order_no: string, used_credits: number) {
    const db = getDb();
    const res = await db.query(
      `UPDATE orders SET used_credits=$1 WHERE order_no=$2`,
      [used_credits, order_no]
    );
    return res;
}