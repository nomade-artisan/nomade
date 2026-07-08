export interface Money {

    value:number;

    currency:"EUR";

}

export interface Contact{

    firstName:string;

    lastName:string;

    email:string;

    phone:string;

    company?:string;

}

export interface Location{

    number:string;

    street:string;

    city:string;

    postalCode:string;

    countryIsoCode:string;

}

export interface Address{

    type:"BUSINESS" | "RESIDENTIAL";

    contact:Contact;

    location:Location;

    additionalInformation?:string;

}

export interface Content{

    id:string;

    description:string;

}

export interface Package{

    type:"PARCEL";

    value:Money;

    weight:number;

    length:number;

    width:number;

    height:number;

    content:Content;

    stackable?:boolean;

    externalId?:string;

}

export interface Shipment{

    externalId:string;

    fromAddress:Address;

    toAddress:Address;

    returnAddress?:Address;

    packages:Package[];

}

export interface CreateShippingOrderRequest{

    insured:boolean;

    labelType:"PDF_A4" | "PDF_10x15";

    shippingOfferCode:string;

    shipment:Shipment;

}

export interface ShippingOrderResponse{

    status:number;

    timestamp:string;

    content:{

        id:string;

        status:string;

        shipmentId:string;

        estimatedDeliveryDate:string;

        expectedTakingOverDate:string;

    }

}