import Image from "next/image";
import Typography from "@/components/common/Typography";

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
			className="flex items-center gap-3 p-3 w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
		>
			<div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
				<Image src={pictureUrl} alt={name} fill className="object-cover" />
			</div>
			<div className="flex-1 text-left overflow-hidden">
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
			</div>
		</button>
	);
}
