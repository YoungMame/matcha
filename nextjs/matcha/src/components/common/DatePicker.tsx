'use client';

import { useEffect, useRef, useState } from "react";
import Typography from "./Typography";

interface DatePickerProps {
	label?: string;
	value?: string;
	onChange?: (date: string) => void;
	error?: string;
	helperText?: string;
	required?: boolean;
	min?: string;
	max?: string;
	placeholder?: string;
	fullWidth?: boolean;
}

// Helper function to convert YYYY-MM-DD to DD/MM/YYYY
const formatInputDate = (dateStr: string | null): string => {
	if (!dateStr) return "";
	const [year, month, day] = dateStr.split('-');
	return `${day}/${month}/${year}`;
};

export default function DatePicker({
	label,
	value = "",
	onChange,
	error,
	helperText,
	required = false,
	min,
	max,
	placeholder = "Pick a date",
	fullWidth = true,
}: DatePickerProps) {
	// Initialize calendar to a sensible date based on constraints
	const getInitialCalendarDate = (): Date => {
		// If there's a selected value, use that
		if (value) {
			return new Date(value + 'T00:00:00');
		}
		// If there's a max date, start there (typically birth date scenarios)
		if (max) {
			return new Date(max + 'T00:00:00');
		}
		// If there's a min date, start there
		if (min) {
			return new Date(min + 'T00:00:00');
		}
		// Default to current date
		return new Date();
	};

	const [currentDate, setCurrentDate] = useState(getInitialCalendarDate());
	const [selectedDate, setSelectedDate] = useState<string | null>(value || null);
	const [inputValue, setInputValue] = useState<string>(value ? formatInputDate(value) : "");
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const daysContainerRef = useRef<HTMLDivElement>(null);
	const datepickerContainerRef = useRef<HTMLDivElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	// Sync external value changes
	useEffect(() => {
		setSelectedDate(value || null);
		setInputValue(value ? formatInputDate(value) : "");
	}, [value]);

	// Close calendar when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setIsCalendarOpen(false);
			}
		};

		if (isCalendarOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => {
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}
	}, [isCalendarOpen]);

	useEffect(() => {
		if (!daysContainerRef.current || !isCalendarOpen) return;

		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDayOfMonth = new Date(year, month, 1).getDay();
		const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		const daysContainer = daysContainerRef.current;
		daysContainer.innerHTML = "";

		// Helper function to check if date is in range
		const checkDateInRange = (day: number): boolean => {
			const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
			if (min && dateStr < min) return false;
			if (max && dateStr > max) return false;
			return true;
		};

		// Empty cells before first day
		for (let i = 0; i < adjustedFirstDay; i++) {
			const emptyDiv = document.createElement("div");
			daysContainer.appendChild(emptyDiv);
		}

		// Day cells
		for (let i = 1; i <= daysInMonth; i++) {
			const dayDiv = document.createElement("div");
			const isInRange = checkDateInRange(i);
			const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
			const isSelected = selectedDate === dateStr;

			dayDiv.className = `
				flex h-[32px] w-[32px] items-center justify-center rounded-md text-sm
				transition-colors
				${isSelected
					? 'bg-pink-500 text-white font-semibold'
					: isInRange
						? 'text-gray-700 hover:bg-gray-100 cursor-pointer dark:text-white dark:hover:bg-gray-700'
						: 'text-gray-300 cursor-not-allowed dark:text-gray-600'
				}
			`;
			dayDiv.textContent = i.toString();

			if (isInRange) {
				dayDiv.addEventListener("click", () => {
					setSelectedDate(dateStr);
					setInputValue(formatInputDate(dateStr));
				});
			}

			daysContainer.appendChild(dayDiv);
		}
	}, [currentDate, isCalendarOpen, selectedDate, min, max]);

	const handlePrevMonth = () => {
		setCurrentDate(
			(prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() - 1)),
		);
	};

	const handleNextMonth = () => {
		setCurrentDate(
			(prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() + 1)),
		);
	};

	const handleApply = () => {
		if (selectedDate && onChange) {
			onChange(selectedDate);
			setInputValue(formatInputDate(selectedDate));
			setIsCalendarOpen(false);
		}
	};

	const handleCancel = () => {
		setSelectedDate(value || null);
		setInputValue(value ? formatInputDate(value) : "");
		setIsCalendarOpen(false);
	};

	const handleToggleCalendar = () => {
		setIsCalendarOpen(!isCalendarOpen);
	};

	const formatDisplayDate = (dateStr: string | null): string => {
		if (!dateStr) return "";
		const date = new Date(dateStr + 'T00:00:00');
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Convert DD/MM/YYYY to YYYY-MM-DD
	const parseInputDate = (input: string): string | null => {
		// Remove any non-digit characters except /
		const cleaned = input.replace(/[^\d/]/g, '');

		// Check if it matches DD/MM/YYYY pattern
		const match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if (!match) return null;

		const [, day, month, year] = match;
		const dateStr = `${year}-${month}-${day}`;

		// Validate the date is real
		const date = new Date(dateStr + 'T00:00:00');
		if (isNaN(date.getTime())) return null;

		// Validate it matches what we put in (catches invalid dates like 31/02/2000)
		if (date.getFullYear() !== parseInt(year) ||
			date.getMonth() + 1 !== parseInt(month) ||
			date.getDate() !== parseInt(day)) {
			return null;
		}

		return dateStr;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let input = e.target.value;

		// Remove any non-digit characters
		const digitsOnly = input.replace(/[^\d]/g, '');

		// Format as DD/MM/YYYY with auto-slashes
		let formatted = digitsOnly;
		if (digitsOnly.length >= 2) {
			formatted = digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2);
		}
		if (digitsOnly.length >= 4) {
			formatted = digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2, 4) + '/' + digitsOnly.slice(4, 8);
		}

		// Update the input value for display
		setInputValue(formatted);

		// Try to parse and validate the date if complete
		if (digitsOnly.length === 8) {
			const parsedDate = parseInputDate(formatted);
			if (parsedDate) {
				// Valid date format
				const isInRange = !(min && parsedDate < min) && !(max && parsedDate > max);
				if (isInRange) {
					setSelectedDate(parsedDate);
					if (onChange) onChange(parsedDate);
				}
			}
		}
	};

	const handleInputBlur = () => {
		// On blur, validate the current input
		const parsedDate = parseInputDate(inputValue);

		if (parsedDate) {
			const isInRange = !(min && parsedDate < min) && !(max && parsedDate > max);
			if (isInRange) {
				// Valid date in range
				setSelectedDate(parsedDate);
				if (onChange) onChange(parsedDate);
				setInputValue(formatInputDate(parsedDate));
			} else {
				// Out of range, revert to previous value
				setInputValue(selectedDate ? formatInputDate(selectedDate) : "");
			}
		} else if (inputValue.trim() !== "") {
			// Invalid format, revert to previous value
			setInputValue(selectedDate ? formatInputDate(selectedDate) : "");
		} else {
			// Empty input, clear selection
			setSelectedDate(null);
			if (onChange) onChange("");
		}
	};

	return (
		<div className={`${fullWidth ? "w-full" : ""} relative`} ref={wrapperRef}>
			{label && (
				<label className="block mb-1">
					<Typography variant="small" bold>
						{label}
						{required && <span className="text-red-500 ml-1">*</span>}
					</Typography>
				</label>
			)}
			<div className="relative">
				<input
					id="datepicker"
					type="text"
					placeholder="DD/MM/YYYY"
					className={`
						h-12 w-full appearance-none rounded-lg border px-4 pr-12
						transition-all outline-none
						${error
							? "border-red-500 focus:ring-2 focus:ring-red-500"
							: "border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
						}
						bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600
					`}
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleInputBlur}
					maxLength={10}
				/>
				<span
					onClick={handleToggleCalendar}
					className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-gray-500 cursor-pointer hover:text-pink-500 transition-colors pointer-events-auto"
				>
					<svg
						width="21"
						height="20"
						viewBox="0 0 21 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M18 3.3125H16.3125V2.625C16.3125 2.25 16 1.90625 15.5937 1.90625C15.1875 1.90625 14.875 2.21875 14.875 2.625V3.28125H6.09375V2.625C6.09375 2.25 5.78125 1.90625 5.375 1.90625C4.96875 1.90625 4.65625 2.21875 4.65625 2.625V3.28125H3C1.9375 3.28125 1.03125 4.15625 1.03125 5.25V16.125C1.03125 17.1875 1.90625 18.0938 3 18.0938H18C19.0625 18.0938 19.9687 17.2187 19.9687 16.125V5.25C19.9687 4.1875 19.0625 3.3125 18 3.3125ZM3 4.71875H4.6875V5.34375C4.6875 5.71875 5 6.0625 5.40625 6.0625C5.8125 6.0625 6.125 5.75 6.125 5.34375V4.71875H14.9687V5.34375C14.9687 5.71875 15.2812 6.0625 15.6875 6.0625C16.0937 6.0625 16.4062 5.75 16.4062 5.34375V4.71875H18C18.3125 4.71875 18.5625 4.96875 18.5625 5.28125V7.34375H2.46875V5.28125C2.46875 4.9375 2.6875 4.71875 3 4.71875ZM18 16.6562H3C2.6875 16.6562 2.4375 16.4062 2.4375 16.0937V8.71875H18.5312V16.125C18.5625 16.4375 18.3125 16.6562 18 16.6562Z"
							fill="currentColor"
						/>
						<path
							d="M9.5 9.59375H8.8125C8.625 9.59375 8.5 9.71875 8.5 9.90625V10.5938C8.5 10.7812 8.625 10.9062 8.8125 10.9062H9.5C9.6875 10.9062 9.8125 10.7812 9.8125 10.5938V9.90625C9.8125 9.71875 9.65625 9.59375 9.5 9.59375Z"
							fill="currentColor"
						/>
						<path
							d="M12.3438 9.59375H11.6562C11.4687 9.59375 11.3438 9.71875 11.3438 9.90625V10.5938C11.3438 10.7812 11.4687 10.9062 11.6562 10.9062H12.3438C12.5312 10.9062 12.6562 10.7812 12.6562 10.5938V9.90625C12.6562 9.71875 12.5312 9.59375 12.3438 9.59375Z"
							fill="currentColor"
						/>
						<path
							d="M15.1875 9.59375H14.5C14.3125 9.59375 14.1875 9.71875 14.1875 9.90625V10.5938C14.1875 10.7812 14.3125 10.9062 14.5 10.9062H15.1875C15.375 10.9062 15.5 10.7812 15.5 10.5938V9.90625C15.5 9.71875 15.375 9.59375 15.1875 9.59375Z"
							fill="currentColor"
						/>
						<path
							d="M6.5 12H5.8125C5.625 12 5.5 12.125 5.5 12.3125V13C5.5 13.1875 5.625 13.3125 5.8125 13.3125H6.5C6.6875 13.3125 6.8125 13.1875 6.8125 13V12.3125C6.8125 12.125 6.65625 12 6.5 12Z"
							fill="currentColor"
						/>
						<path
							d="M9.5 12H8.8125C8.625 12 8.5 12.125 8.5 12.3125V13C8.5 13.1875 8.625 13.3125 8.8125 13.3125H9.5C9.6875 13.3125 9.8125 13.1875 9.8125 13V12.3125C9.8125 12.125 9.65625 12 9.5 12Z"
							fill="currentColor"
						/>
						<path
							d="M12.3438 12H11.6562C11.4687 12 11.3438 12.125 11.3438 12.3125V13C11.3438 13.1875 11.4687 13.3125 11.6562 13.3125H12.3438C12.5312 13.3125 12.6562 13.1875 12.6562 13V12.3125C12.6562 12.125 12.5312 12 12.3438 12Z"
							fill="currentColor"
						/>
						<path
							d="M15.1875 12H14.5C14.3125 12 14.1875 12.125 14.1875 12.3125V13C14.1875 13.1875 14.3125 13.3125 14.5 13.3125H15.1875C15.375 13.3125 15.5 13.1875 15.5 13V12.3125C15.5 12.125 15.375 12 15.1875 12Z"
							fill="currentColor"
						/>
						<path
							d="M6.5 14.4062H5.8125C5.625 14.4062 5.5 14.5312 5.5 14.7187V15.4062C5.5 15.5938 5.625 15.7188 5.8125 15.7188H6.5C6.6875 15.7188 6.8125 15.5938 6.8125 15.4062V14.7187C6.8125 14.5312 6.65625 14.4062 6.5 14.4062Z"
							fill="currentColor"
						/>
						<path
							d="M9.5 14.4062H8.8125C8.625 14.4062 8.5 14.5312 8.5 14.7187V15.4062C8.5 15.5938 8.625 15.7188 8.8125 15.7188H9.5C9.6875 15.7188 9.8125 15.5938 9.8125 15.4062V14.7187C9.8125 14.5312 9.65625 14.4062 9.5 14.4062Z"
							fill="currentColor"
						/>
						<path
							d="M12.3438 14.4062H11.6562C11.4687 14.4062 11.3438 14.5312 11.3438 14.7187V15.4062C11.3438 15.5938 11.4687 15.7188 11.6562 15.7188H12.3438C12.5312 15.7188 12.6562 15.5938 12.6562 15.4062V14.7187C12.6562 14.5312 12.5312 14.4062 12.3438 14.4062Z"
							fill="currentColor"
						/>
					</svg>
				</span>
			</div>

			{(error || helperText) && (
				<Typography
					variant="caption"
					color={error ? "error" : "secondary"}
					className="mt-1 ml-1"
				>
					{error || helperText}
				</Typography>
			)}

			{isCalendarOpen && (
				<div
					ref={datepickerContainerRef}
					className="absolute z-10 mt-2 left-0 w-full max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700"
				>
					<div className="flex items-center justify-between mb-3">
						<button
							type="button"
							className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:border-pink-500 hover:bg-pink-500 hover:text-white dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors"
							onClick={handlePrevMonth}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="fill-current"
							>
								<path d="M16.2375 21.4875C16.0125 21.4875 15.7875 21.4125 15.6375 21.225L7.16249 12.6C6.82499 12.2625 6.82499 11.7375 7.16249 11.4L15.6375 2.77498C15.975 2.43748 16.5 2.43748 16.8375 2.77498C17.175 3.11248 17.175 3.63748 16.8375 3.97498L8.96249 12L16.875 20.025C17.2125 20.3625 17.2125 20.8875 16.875 21.225C16.65 21.375 16.4625 21.4875 16.2375 21.4875Z" />
							</svg>
						</button>

						<span className="text-base font-medium text-gray-900 dark:text-white">
							{currentDate.toLocaleDateString("en-US", {
								month: "long",
								year: "numeric",
							})}
						</span>

						<button
							type="button"
							className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:border-pink-500 hover:bg-pink-500 hover:text-white dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors"
							onClick={handleNextMonth}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="fill-current"
							>
								<path d="M7.7625 21.4875C7.5375 21.4875 7.35 21.4125 7.1625 21.2625C6.825 20.925 6.825 20.4 7.1625 20.0625L15.0375 12L7.1625 3.97498C6.825 3.63748 6.825 3.11248 7.1625 2.77498C7.5 2.43748 8.025 2.43748 8.3625 2.77498L16.8375 11.4C17.175 11.7375 17.175 12.2625 16.8375 12.6L8.3625 21.225C8.2125 21.375 7.9875 21.4875 7.7625 21.4875Z" />
							</svg>
						</button>
					</div>

					<div className="grid grid-cols-7 gap-1 text-center mb-2">
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400 h-6 flex items-center justify-center">Mo</span>
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400 h-6 flex items-center justify-center">Tu</span>
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400 h-6 flex items-center justify-center">We</span>
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400 h-6 flex items-center justify-center">Th</span>
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400 h-6 flex items-center justify-center">Fr</span>
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400 h-6 flex items-center justify-center">Sa</span>
						<span className="text-xs font-medium text-gray-600 dark:text-gray-400 h-6 flex items-center justify-center">Su</span>
					</div>

					<div
						ref={daysContainerRef}
						className="grid grid-cols-7 gap-1 mb-3"
					>
						{/* Days will be rendered here */}
					</div>

					<div className="flex items-center gap-2">
						<button
							type="button"
							className="flex h-10 w-full items-center justify-center rounded-md bg-gray-700 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
							onClick={handleCancel}
						>
							Cancel
						</button>
						<button
							type="button"
							className="flex h-10 w-full items-center justify-center rounded-md bg-pink-500 text-sm font-medium text-white hover:bg-pink-600 transition-colors"
							onClick={handleApply}
						>
							Apply
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
