import { boxtal } from "./client";

import {

    CreateShippingOrderRequest,

    ShippingOrderResponse

} from "./types";

export async function createShippingOrder(

    payload:CreateShippingOrderRequest

){

    const {data} = await boxtal.post<ShippingOrderResponse>(

        "/shipping/v3.1/shipping-order",

        payload

    );

    return data;

}