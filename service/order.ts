import { UserCredits } from "@/types/user";
import { getUserOrders } from "@/models/order";
import { Order } from "@/types/order";
import {getUserOrdersAsc, updateOrderUsedCredits} from "@/models/order";

export async function getUserCredits(user_email: string): Promise<UserCredits> {
    let user_credits: UserCredits = {
      one_time_credits: 0,
      monthly_credits: 0,
      total_credits: 0,
      used_credits: 0,
      left_credits: 0,
    };
  
    try {
  
      const orders = await getUserOrders(user_email);
      if (orders) {
        orders.forEach((order: Order) => {
          user_credits.one_time_credits += order.credits;
          user_credits.used_credits += order.used_credits;
          user_credits.total_credits += order.credits;
        });
      }
  
      user_credits.left_credits = user_credits.total_credits - user_credits.used_credits;
      if (user_credits.left_credits < 0) {
        user_credits.left_credits = 0;
      }
  
      return user_credits;
    } catch (e) {
      console.log("get user credits failed: ", e);
      return user_credits;
    }
}

export async function consumeCredits(user_email: string) {
    const order = await getUserOrdersAsc(user_email);
    if (!order) {
        return undefined;
    }

    const { order_no, used_credits  } = order;
    const res = await updateOrderUsedCredits(order_no, used_credits + 1);
    return res;
}
  