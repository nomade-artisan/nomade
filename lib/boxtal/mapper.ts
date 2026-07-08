import { Order } from "@/lib/orders/types";
import { BOXTAL } from "./constants";
import { CreateShippingOrderRequest } from "./types";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  street: string;
  number: string;

  postalCode: string;
  city: string;

  country: string;
}

export function mapOrderToBoxtal(
  order: Order
): CreateShippingOrderRequest {

  const address = order.shipping_address as ShippingAddress;

  return {

    insured: false,

    labelType: BOXTAL.LABEL_TYPE,

    shippingOfferCode: BOXTAL.DEFAULT_SHIPPING_OFFER,

    shipment: {

      externalId: order.order_number ?? order.id,

      fromAddress: {

        type: "BUSINESS",

        contact: {

          firstName: "Merveilles",

          lastName: "Katabi",

          company: "Nomade",

          email: process.env.CONTACT_EMAIL!,

          phone: process.env.CONTACT_PHONE!

        },

        location: {

          number: process.env.CONTACT_NUMBER!,

          street: process.env.CONTACT_STREET!,

          city: process.env.CONTACT_CITY!,

          postalCode: process.env.CONTACT_POSTAL_CODE!,

          countryIsoCode: "FR"

        }

      },

      toAddress: {

        type: "RESIDENTIAL",

        contact: {

          firstName: address.firstName,

          lastName: address.lastName,

          email: address.email,

          phone: address.phone

        },

        location: {

          number: address.number,

          street: address.street,

          city: address.city,

          postalCode: address.postalCode,

          countryIsoCode: address.country

        }

      },

      packages: [

        {

          type: "PARCEL",

          value: {

            value: Number(order.total),

            currency: "EUR"

          },

          weight: BOXTAL.DEFAULT_PACKAGE.weight,

          length: BOXTAL.DEFAULT_PACKAGE.length,

          width: BOXTAL.DEFAULT_PACKAGE.width,

          height: BOXTAL.DEFAULT_PACKAGE.height,

          content: {

            id: BOXTAL.DEFAULT_CONTENT_ID,

            description: BOXTAL.DEFAULT_CONTENT_DESCRIPTION

          },

          stackable: true,

          externalId: order.id

        }

      ]

    }

  };

}