'use client';

import Typography from './Typography';
import Button from './Button';
import Modal from './Modal';

interface ErrorModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	message: string;
}

export default function ErrorModal({
	isOpen,
	onClose,
	title = 'Erreur',
	message,
}: ErrorModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			showCloseButton={false}
			backdropBlur="backdrop-blur-sm"
			backdropOpacity="bg-black/50"
		>
			{/* Icon */}
			<div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
				<svg
					className="w-6 h-6 text-red-600 dark:text-red-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>

			{/* Title */}
			<Typography variant="h3" align="center" className="mb-2">
				{title}
			</Typography>

			{/* Message */}
			<Typography variant="body" color="secondary" align="center" className="mb-6">
				{message}
			</Typography>

			{/* Button */}
			<Button variant="gradient" onClick={onClose} className="w-full">
				Compris
			</Button>
		</Modal>
	);
}
