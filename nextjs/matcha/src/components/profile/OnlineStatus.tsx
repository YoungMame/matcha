import Badge from "@/components/common/Badge";
import Typography from "@/components/common/Typography";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface OnlineStatusProps {
  isOnline: boolean;
  lastSeenAt?: Date;
}

export default function OnlineStatus({ isOnline, lastSeenAt }: OnlineStatusProps) {
  if (isOnline) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <Badge variant="success" size="small">
          En ligne
        </Badge>
      </div>
    );
  }

  if (lastSeenAt) {
    const timeAgo = formatDistanceToNow(lastSeenAt, {
      addSuffix: true,
      locale: fr,
    });

    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full" />
        <Typography variant="small" color="secondary">
          Vu {timeAgo}
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-gray-400 rounded-full" />
      <Typography variant="small" color="secondary">
        Hors ligne
      </Typography>
    </div>
  );
}
