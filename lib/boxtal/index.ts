// lib/boxtal/index.ts

import { mapOrderToBoxtal } from "./mapper";
import { cancelShippingOrder, createShippingOrder } from "./shippingOrders";
import { getShippingDocuments } from "./documents";
import { getTracking } from "./tracking";

import { Order } from "@/lib/orders/types";

export class BoxtalService {

    async generateLabel(order: Order) {

        const payload = mapOrderToBoxtal(order);

        return await createShippingOrder(payload);

    }

    async documents(shippingOrderId: string) {

        return await getShippingDocuments(shippingOrderId);

    }

    async tracking(shippingOrderId: string) {

        return await getTracking(shippingOrderId);

    }

    async cancel(shippingOrderId: string) {

        return await cancelShippingOrder(shippingOrderId);

    }

}

export const Boxtal = new BoxtalService();