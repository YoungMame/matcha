import Image from "next/image";
import Link from "next/link";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";
import IconButton from "@/components/common/IconButton";
import Link from "next/dist/client/link";

interface UserHeaderProps {
	username: string;
	pictureUrl: string;
	isLoading: boolean;
	error: string | null;
}

export default function UserHeader({ username, pictureUrl, isLoading, error }: UserHeaderProps) {
	return (
		<Stack
			direction="row"
			align="center"
			justify="between"
			className="p-4 border-b border-gray-200 dark:border-gray-700"
		>
			<Link href="/me" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
				<div className="relative w-10 h-10 rounded-full overflow-hidden">
					<Image
						src={pictureUrl}
						alt={username}
						fill
						className="object-cover"
						unoptimized
					/>
				</div>
				<Typography variant="body" className="font-semibold">
					{ isLoading ? "Loading..." : error ? `Error` : `Vous: ${username}`}
				</Typography>
			</Link>
			
			<Link href="/me">
				<IconButton
					variant="secondary"
					size="small"
					aria-label="Settings"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
				</IconButton>
			</Link>
		</Stack>
	);
}
