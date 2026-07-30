//lib/boxtal/constants.ts
export const BOXTAL = {

    API_VERSION: "v3.1",

    LABEL_TYPE: "PDF_A4",

    DEFAULT_SHIPPING_OFFER: "POFR-ColissimoAccess",

    DEFAULT_CONTENT_ID: "content:v1:40130",

    DEFAULT_CONTENT_DESCRIPTION: "Sac Nomade",

    DEFAULT_PACKAGE: {

        type: "PARCEL",

        weight: 0.9,

        length: 35,

        width: 25,

        height: 10

    }

} as const;