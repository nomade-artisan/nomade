// lib/boxtal/mapper.ts

import { Order } from "@/lib/orders/types";
import { BOXTAL } from "./constants";
import { CreateShippingOrderRequest } from "./types";

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  street?: string;
  number?: string;
  line1?: string;
  line2?: string;

  postalCode?: string;
  postal_code?: string;
  city?: string;

  country?: string;
}

function splitAddressLine(line1: string) {
  const parts = line1.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { number: "", street: line1 };
  }

  const firstPart = parts[0];
  if (/^[0-9]+[A-Za-zÀ-ÿ]*$/.test(firstPart)) {
    return {
      number: firstPart,
      street: parts.slice(1).join(" "),
    };
  }

  return {
    number: "",
    street: line1,
  };
}

function normalizeSingleValue(value?: string) {
  if (!value) return "";
  return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean)[0] || "";
}

export function mapOrderToBoxtal(
  order: Order
): CreateShippingOrderRequest {

  const address = order.shipping_address as ShippingAddress;
  const line1 = address.line1 || address.street || "";
  const { number, street } = splitAddressLine(line1);
  const postalCode = address.postal_code || address.postalCode || "";
  const country = address.country || "FR";

  const toEmail = normalizeSingleValue(
    address.email || process.env.CONTACT_EMAIL!
  );
  const toPhone = normalizeSingleValue(
    address.phone || process.env.CONTACT_PHONE!
  );
  const toFirstName = normalizeSingleValue(address.firstName) || "Client";
  const toLastName = normalizeSingleValue(address.lastName) || "Client";
  const fromEmail = normalizeSingleValue(
    process.env.BOXTAL_SENDER_EMAIL || process.env.CONTACT_EMAIL!
  );
  const fromPhone = normalizeSingleValue(
    process.env.BOXTAL_SENDER_PHONE || process.env.CONTACT_PHONE!
  );

  return {
    insured: false,
    labelType: BOXTAL.LABEL_TYPE,
    shippingOfferCode: BOXTAL.DEFAULT_SHIPPING_OFFER,
    shipment: {
      externalId: order.order_number ?? order.id,
      fromAddress: {
        type: "BUSINESS",
        contact: {
          firstName: process.env.BOXTAL_SENDER_FIRST_NAME || "Nomade",
          lastName: process.env.BOXTAL_SENDER_LAST_NAME || "Paris",
          company: process.env.BOXTAL_SENDER_COMPANY || "Nomade",
          email: fromEmail,
          phone: fromPhone,
        },
        location: {
          number: process.env.BOXTAL_SENDER_NUMBER || "1",
          street: process.env.BOXTAL_SENDER_STREET || "1 Rue de la Paix",
          city: process.env.BOXTAL_SENDER_CITY || "Paris",
          postalCode: process.env.BOXTAL_SENDER_POSTAL_CODE || "75001",
          countryIsoCode: process.env.BOXTAL_SENDER_COUNTRY || "FR",
        },
      },
      toAddress: {
        type: "RESIDENTIAL",
        contact: {
          firstName: toFirstName,
          lastName: toLastName,
          email: toEmail,
          phone: toPhone,
        },
        location: {
          number,
          street,
          city: address.city || "",
          postalCode,
          countryIsoCode: country,
        },
        additionalInformation: address.line2 || undefined,
      },
      packages: [
        {
          type: "PARCEL",
          value: {
            value: Number(order.total),
            currency: "EUR",
          },
          weight: BOXTAL.DEFAULT_PACKAGE.weight,
          length: BOXTAL.DEFAULT_PACKAGE.length,
          width: BOXTAL.DEFAULT_PACKAGE.width,
          height: BOXTAL.DEFAULT_PACKAGE.height,
          content: {
            id: BOXTAL.DEFAULT_CONTENT_ID,
            description: BOXTAL.DEFAULT_CONTENT_DESCRIPTION,
          },
          stackable: true,
          externalId: order.id,
        },
      ],
    },
  };
}
