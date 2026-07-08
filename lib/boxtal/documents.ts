import { boxtal } from "./client";

export async function getShippingDocuments(

    shippingOrderId:string

){

    const {data}=await boxtal.get(

        `/shipping/v3.1/shipping-order/${shippingOrderId}/shipping-document`

    );

    return data;

}