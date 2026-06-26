import { Badge } from "@/components/ui/badge";

export default function ProductStatusBadge({
  status,
}: {
  status: string;
}) {
  switch (status) {
    case "active":
      return (
        <Badge>
          Actif
        </Badge>
      );

    case "archived":
      return (
        <Badge variant="secondary">
          Archivé
        </Badge>
      );

    default:
      return (
        <Badge variant="outline">
          Brouillon
        </Badge>
      );
  }
}