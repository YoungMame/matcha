import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";

interface MessageBubbleProps {
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

export default function MessageBubble({
  content,
  timestamp,
  isCurrentUser,
}: MessageBubbleProps) {
  return (
    <Stack
      spacing="xs"
      className={`max-w-[70%] rounded-lg px-4 py-2 ${
        isCurrentUser
          ? "bg-indigo-600 text-white"
          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      }`}
    >
      <Typography
        variant="body"
        className={isCurrentUser ? "text-white" : ""}
      >
        {content}
      </Typography>
      <Typography
        variant="small"
        className={
          isCurrentUser
            ? "text-indigo-200"
            : "text-gray-500 dark:text-gray-400"
        }
      >
        {new Date(timestamp).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Typography>
    </Stack>
  );
}
