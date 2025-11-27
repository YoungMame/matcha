import Image from "next/image";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";

interface ProfileCardProps {
	id: string;
	name: string;
	age: number;
	pictureUrl: string;
	onClick?: () => void;
}

export default function ProfileCard({
	name,
	age,
	pictureUrl,
	onClick,
}: ProfileCardProps) {
	return (
		<button
			onClick={onClick}
			className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow bg-white dark:bg-gray-800"
		>
			{/* Image */}
			<div className="relative aspect-3/4 w-full overflow-hidden">
				<Image
					unoptimized
					src={pictureUrl}
					alt={name}
					fill
					className="object-cover group-hover:scale-105 transition-transform duration-300"
				/>
			</div>

			{/* Info overlay at bottom */}
			<Stack
				direction="column"
				spacing="none"
				className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4"
			>
				<Typography variant="body" className="font-semibold text-white">
					{name}, {age}
				</Typography>
			</Stack>
		</button>
	);
}
