import Icon from "@/components/common/Icon";
import Stack from "@/components/common/Stack";
import { DropdownItem } from "@/components/common/Dropdown";

interface SortOptionProps {
	label: string;
	isActive: boolean;
	onClick: () => void;
}

export default function SortOption({
	label,
	isActive,
	onClick,
}: SortOptionProps) {
	return (
		<DropdownItem onClick={onClick} isActive={isActive}>
			<Stack direction="row" justify="between" align="center">
				<span>{label}</span>
				{isActive && <Icon name="check" className="w-4 h-4" />}
			</Stack>
		</DropdownItem>
	);
}
