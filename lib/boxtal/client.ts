//lib/boxtal/client.ts
import axios from "axios";

const accessKey = process.env.BOXTAL_PUBLIC_KEY!;

const secretKey = process.env.BOXTAL_SECRET_KEY!;

const credentials = Buffer
.from(`${accessKey}:${secretKey}`)
.toString("base64");

export const boxtal = axios.create({

    baseURL:"https://api.boxtal.build",

    headers:{

        Authorization:`Basic ${credentials}`,

        Accept:"application/json",

        "Content-Type":"application/json"

    },

    timeout:30000

});