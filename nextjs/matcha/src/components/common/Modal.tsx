import { ReactNode } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	showCloseButton?: boolean;
	backdropBlur?: string;
	backdropOpacity?: string;
	maxWidth?: string;
	padding?: string;
}

export default function Modal({
	isOpen,
	onClose,
	children,
	showCloseButton = true,
	backdropBlur = "backdrop-blur-[2px]",
	backdropOpacity = "bg-black/10",
	maxWidth = "max-w-md",
	padding = "p-8",
}: ModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className={`absolute inset-0 ${backdropBlur} ${backdropOpacity}`}
				onClick={onClose}
			/>
			<div className={`relative bg-white rounded-lg shadow-xl w-full ${maxWidth} mx-4 ${padding}`}>
				{showCloseButton && (
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				)}
				{children}
			</div>
		</div>
	);
}
