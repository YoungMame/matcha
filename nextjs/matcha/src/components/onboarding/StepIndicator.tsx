'use client';

import Typography from '@/components/common/Typography';
import { StepConfig } from '@/types/onboarding';

interface StepIndicatorProps {
	steps: StepConfig[];
	currentStepIndex: number;
	isStepCompleted: (stepIndex: number) => boolean;
	onStepClick: (stepIndex: number) => void;
}

export default function StepIndicator({
	steps,
	currentStepIndex,
	isStepCompleted,
	onStepClick,
}: StepIndicatorProps) {
	return (
		<div className="space-y-2 lg:space-y-6">
			<Typography variant="h3" className="mb-3 lg:mb-8">
				Getting Started
			</Typography>

			{steps.map((step, index) => {
				const isCompleted = isStepCompleted(index);
				const isCurrent = index === currentStepIndex;

				return (
					<button
						key={step.id}
						onClick={() => onStepClick(index)}
						className={`
							w-full text-left p-2 lg:p-3 rounded-lg transition-all
							cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
							${isCurrent ? 'bg-pink-50 dark:bg-pink-900/20' : ''}
						`}
					>
						<div className="flex items-center gap-2 lg:gap-3">
							<div
								className={`
									flex items-center justify-center
									w-7 h-7 lg:w-8 lg:h-8 rounded-full
									transition-all
									${isCompleted
										? 'bg-green-500 text-white'
										: isCurrent
											? 'bg-pink-500 text-white'
											: 'bg-gray-200 dark:bg-gray-700 text-gray-500'
									}
								`}
							>
								{isCompleted ? (
									<svg
										className="w-4 h-4 lg:w-5 lg:h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								) : (
									<span className="text-xs lg:text-sm font-semibold">{index + 1}</span>
								)}
							</div>

							<Typography
								variant="body"
								bold={isCurrent}
								color={isCompleted || isCurrent ? 'primary' : 'secondary'}
							>
								{step.label}
							</Typography>
						</div>
					</button>
				);
			})}
		</div>
	);
}
