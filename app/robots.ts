import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/admin-login", "/api/", "/cart", "/success"],
      },
    ],

    sitemap: "https://www.nomade-artisan.fr/sitemap.xml",
  };
}