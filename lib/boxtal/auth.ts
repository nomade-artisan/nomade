import { boxtal } from "./client";

export async function testBoxtalConnection() {
  const response = await boxtal.get("/shipping/v3.1/content-category");

  return response.data;
}