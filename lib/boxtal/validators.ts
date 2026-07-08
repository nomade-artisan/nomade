import { Order } from "@/lib/orders/types";

export function validateOrder(order:Order){

    if(!order.shipping_address){

        throw new Error("Adresse de livraison absente");

    }

    if(order.status!=="confirmed"){

        throw new Error("Commande non confirmée");

    }

}