import Image from "next/image";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";

interface ConversationItemProps {
	id: string;
	name: string;
	pictureUrl: string;
	lastMessage: string;
	onClick?: () => void;
}

export default function ConversationItem({
	name,
	pictureUrl,
	lastMessage,
	onClick,
}: ConversationItemProps) {
	return (
		<button
			onClick={onClick}
			className="p-3 w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg text-left"
		>
			<Stack direction="row" align="center" spacing="md" className="w-full">
				<div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
					<Image src={pictureUrl} alt={name} fill className="object-cover" />
				</div>
				<Stack direction="column" spacing="xs" className="flex-1 overflow-hidden">
					<Typography variant="body" className="font-medium">
						{name}
					</Typography>
					<Typography
						variant="small"
						color="secondary"
						className="truncate block"
					>
						{lastMessage}
					</Typography>
				</Stack>
			</Stack>
		</button>
	);
}
