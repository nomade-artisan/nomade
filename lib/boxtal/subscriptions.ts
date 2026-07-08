import { boxtal } from "./client";

export async function createSubscription(

    eventType:"DOCUMENT_CREATED"|"TRACKING_CHANGED",

    callbackUrl:string,

    webhookSecret:string

){

    const {data}=await boxtal.post(

        "/shipping/v3.1/subscription",

        {

            eventType,

            callbackUrl,

            webhookSecret

        }

    );

    return data;

}