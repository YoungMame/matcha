import Icon from "@/components/common/Icon";
import Stack from "@/components/common/Stack";
import { DropdownItem } from "@/components/common/Dropdown";

interface ToggleSortOptionProps {
	label: string;
	state: "asc" | "desc" | "none";
	onClick: () => void;
}

export default function ToggleSortOption({
	label,
	state,
	onClick,
}: ToggleSortOptionProps) {
	const isActive = state !== "none";

	return (
		<DropdownItem onClick={onClick} isActive={isActive}>
			<Stack direction="row" justify="between" align="center">
				<span>{label}</span>
				<Stack direction="row" spacing="sm" align="center">
					{state !== "none" && (
						<span className="text-xs font-medium">
							{state === "asc" ? "Croissant" : "Décroissant"}
						</span>
					)}
					{state === "asc" && <Icon name="chevron-up" className="w-4 h-4" />}
					{state === "desc" && <Icon name="chevron-down" className="w-4 h-4" />}
				</Stack>
			</Stack>
		</DropdownItem>
	);
}
