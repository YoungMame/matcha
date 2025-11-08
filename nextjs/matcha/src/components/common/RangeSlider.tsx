"use client";

import { useState, useRef, useEffect } from "react";

interface RangeSliderProps {
	min: number;
	max: number;
	value: [number, number];
	onChange: (value: [number, number]) => void;
	step?: number;
	label?: string;
	unit?: string;
	formatValue?: (value: number) => string;
	className?: string;
}

export default function RangeSlider({
	min,
	max,
	value,
	onChange,
	step = 1,
	label,
	unit = "",
	formatValue,
	className = "",
}: RangeSliderProps) {
	const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
	const sliderRef = useRef<HTMLDivElement>(null);

	const formatDisplayValue = (val: number) => {
		if (formatValue) return formatValue(val);
		return `${val}${unit}`;
	};

	const getPercentage = (val: number) => {
		return ((val - min) / (max - min)) * 100;
	};

	const getValueFromPosition = (clientX: number) => {
		if (!sliderRef.current) return min;

		const rect = sliderRef.current.getBoundingClientRect();
		const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		const rawValue = min + percentage * (max - min);
		const steppedValue = Math.round(rawValue / step) * step;
		return Math.max(min, Math.min(max, steppedValue));
	};

	const handleMouseDown = (thumb: "min" | "max") => (e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(thumb);
	};

	const handleTouchStart = (thumb: "min" | "max") => (e: React.TouchEvent) => {
		e.preventDefault();
		setIsDragging(thumb);
	};

	const handleTrackClick = (e: React.MouseEvent) => {
		// Don't handle clicks if we're clicking on a thumb
		if ((e.target as HTMLElement).getAttribute("role") === "slider") {
			return;
		}

		const newValue = getValueFromPosition(e.clientX);
		const distanceToMin = Math.abs(newValue - value[0]);
		const distanceToMax = Math.abs(newValue - value[1]);

		// Move the closest thumb to the clicked position
		if (distanceToMin <= distanceToMax) {
			onChange([Math.min(newValue, value[1]), value[1]]);
		} else {
			onChange([value[0], Math.max(newValue, value[0])]);
		}
	};

	useEffect(() => {
		if (!isDragging) return;

		const handleMove = (e: MouseEvent | TouchEvent) => {
			e.preventDefault();
			const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
			const newValue = getValueFromPosition(clientX);

			if (isDragging === "min") {
				onChange([Math.min(newValue, value[1]), value[1]]);
			} else {
				onChange([value[0], Math.max(newValue, value[0])]);
			}
		};

		const handleEnd = () => {
			setIsDragging(null);
		};

		document.addEventListener("mousemove", handleMove);
		document.addEventListener("mouseup", handleEnd);
		document.addEventListener("touchmove", handleMove);
		document.addEventListener("touchend", handleEnd);

		return () => {
			document.removeEventListener("mousemove", handleMove);
			document.removeEventListener("mouseup", handleEnd);
			document.removeEventListener("touchmove", handleMove);
			document.removeEventListener("touchend", handleEnd);
		};
	}, [isDragging, value, min, max, onChange]);

	const minPercentage = getPercentage(value[0]);
	const maxPercentage = getPercentage(value[1]);

	return (
		<div className={`w-full ${className}`}>
			{/* Label and Values */}
			{label && (
				<div className="flex items-center justify-between mb-2">
					<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
						{label}
					</label>
					<div className="text-sm text-gray-600 dark:text-gray-400">
						{formatDisplayValue(value[0])} - {formatDisplayValue(value[1])}
					</div>
				</div>
			)}

			{/* Slider Track */}
			<div className="relative pt-2 pb-4">
				<div
					ref={sliderRef}
					className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
					onClick={handleTrackClick}
				>
					{/* Active Range */}
					<div
						className="absolute h-2 bg-indigo-600 dark:bg-indigo-500 rounded-full pointer-events-none"
						style={{
							left: `${minPercentage}%`,
							width: `${maxPercentage - minPercentage}%`,
						}}
					/>

					{/* Min Thumb */}
					<div
						className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-800 border-2 border-indigo-600 dark:border-indigo-500 rounded-full cursor-grab shadow-md transition-transform ${
							isDragging === "min" ? "scale-110 cursor-grabbing" : "hover:scale-110"
						}`}
						style={{ left: `${minPercentage}%`, transform: "translate(-50%, -50%)" }}
						onMouseDown={handleMouseDown("min")}
						onTouchStart={handleTouchStart("min")}
						role="slider"
						aria-valuemin={min}
						aria-valuemax={value[1]}
						aria-valuenow={value[0]}
						tabIndex={0}
					/>

					{/* Max Thumb */}
					<div
						className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-800 border-2 border-indigo-600 dark:border-indigo-500 rounded-full cursor-grab shadow-md transition-transform ${
							isDragging === "max" ? "scale-110 cursor-grabbing" : "hover:scale-110"
						}`}
						style={{ left: `${maxPercentage}%`, transform: "translate(-50%, -50%)" }}
						onMouseDown={handleMouseDown("max")}
						onTouchStart={handleTouchStart("max")}
						role="slider"
						aria-valuemin={value[0]}
						aria-valuemax={max}
						aria-valuenow={value[1]}
						tabIndex={0}
					/>
				</div>
			</div>
		</div>
	);
}
