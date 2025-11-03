import Badge from "@/components/common/Badge";
import { ConnectionStatus } from "@/types/profileInteraction";

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
}

export default function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
  if (status === 'none') return null;

  const badges = {
    connected: (
      <Badge variant="success" size="medium">
        ✨ Connectés
      </Badge>
    ),
    liked_by_them: (
      <Badge variant="info" size="medium">
        💙 Vous a liké
      </Badge>
    ),
    you_liked: (
      <Badge variant="primary" size="medium">
        ❤️ Vous avez liké
      </Badge>
    ),
  };

  return badges[status];
}
