'use client';

interface ProgressBarProps {
	completedSteps: number;
	totalSteps: number;
}

export default function ProgressBar({ completedSteps, totalSteps }: ProgressBarProps) {
	const progress = (completedSteps / totalSteps) * 100;

	return (
		<div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
			<div
				className="h-full bg-linear-to-r from-pink-500 to-orange-400 transition-all duration-500 ease-out"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
}
