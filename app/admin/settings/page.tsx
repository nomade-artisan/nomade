import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Paramètres</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nom du site</label>
            <Input defaultValue="Nomade" />
          </div>
          <div>
            <label className="text-sm font-medium">Email de contact</label>
            <Input defaultValue="contact@nomade.fr" />
          </div>
          <Button>Enregistrer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Instagram</label>
            <Input placeholder="https://instagram.com/nomade" />
          </div>
          <div>
            <label className="text-sm font-medium">Facebook</label>
            <Input placeholder="https://facebook.com/nomade" />
          </div>
          <Button variant="outline">Enregistrer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Activer le mode maintenance rendra le site inaccessible aux visiteurs.
          </p>
          <Button variant="destructive">Activer le mode maintenance</Button>
        </CardContent>
      </Card>
    </div>
  );
}