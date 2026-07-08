import { boxtal } from "./client";

export async function getTracking(

    shippingOrderId:string

){

    const {data}=await boxtal.get(

        `/shipping/v3.1/shipping-order/${shippingOrderId}/tracking`

    );

    return data;

}