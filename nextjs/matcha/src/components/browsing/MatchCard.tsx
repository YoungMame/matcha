import Image from "next/image";
import Typography from "@/components/common/Typography";

interface MatchCardProps {
	id: string;
	name: string;
	pictureUrl: string;
	onClick?: () => void;
}

export default function MatchCard({
	name,
	pictureUrl,
	onClick,
}: MatchCardProps) {
	return (
		<button
			onClick={onClick}
			className="flex items-center gap-3 p-3 w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
		>
			<div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
				<Image src={pictureUrl} alt={name} fill className="object-cover" />
			</div>
			<Typography variant="body" className="font-medium text-left">
				{name}
			</Typography>
		</button>
	);
}
