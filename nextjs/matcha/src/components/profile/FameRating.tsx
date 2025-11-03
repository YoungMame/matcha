import Badge from "@/components/common/Badge";
import Typography from "@/components/common/Typography";

interface FameRatingProps {
  fame: number;
}

export default function FameRating({ fame }: FameRatingProps) {
  const getVariant = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 50) return "primary";
    if (score >= 20) return "warning";
    return "secondary";
  };

  const getLabel = (score: number) => {
    if (score >= 80) return "Très populaire";
    if (score >= 50) return "Populaire";
    if (score >= 20) return "En croissance";
    return "Nouveau";
  };

  return (
    <div className="flex items-center gap-3">
      <Typography variant="small" color="secondary">
        Score de popularité:
      </Typography>
      <Badge variant={getVariant(fame)} size="medium">
        {fame}/100
      </Badge>
      <Typography variant="small" color="secondary">
        {getLabel(fame)}
      </Typography>
    </div>
  );
}
