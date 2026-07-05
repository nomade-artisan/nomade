import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  BarChart3,
} from "lucide-react";

const modules = [
  {
    title: "Produits",
    description: "Gérer votre catalogue",
    href: "/admin/products",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Commandes",
    description: "Suivi et expéditions",
    href: "/admin/orders",
    icon: ShoppingCart,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Clients",
    description: "Fiches et historique",
    href: "/admin/customers",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Catégories",
    description: "Organiser le catalogue",
    href: "/admin/categories",
    icon: FolderOpen,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Dashboard",
    description: "Analytics & prédictions",
    href: "/admin/dashboard",   // ✅ Route corrigée
    icon: BarChart3,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenue dans l&apos;espace d&apos;administration de Nomade.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className={`p-2 rounded-lg ${mod.bgColor}`}>
                    <Icon className={`h-6 w-6 ${mod.color}`} />
                  </div>
                  <CardTitle className="text-lg">{mod.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {mod.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Accès rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/products/new">
                <Package className="mr-2 h-4 w-4" />
                Nouveau produit
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Voir les commandes
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques globales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Les statistiques complètes sont disponibles dans le tableau de bord.
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/dashboard">Voir le dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}