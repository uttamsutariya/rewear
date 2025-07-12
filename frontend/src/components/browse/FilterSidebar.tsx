import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface FilterSidebarProps {
	filters: {
		category?: string;
		type?: string;
		size?: string;
		condition?: string;
	};
	onFilterChange: (filters: any) => void;
	onClearFilters: () => void;
	mobile?: boolean;
}

const CATEGORIES = ["Men", "Women", "Kids", "Unisex"];
const TYPES = ["Shirt", "Pants", "Dress", "Jacket", "Shoes", "Accessories", "Other"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

export function FilterSidebar({ filters, onFilterChange, onClearFilters, mobile }: FilterSidebarProps) {
	const hasActiveFilters = Object.values(filters).some((value) => value);

	return (
		<div className={cn("space-y-6", mobile && "pb-4")}>
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900">Filters</h3>
				{hasActiveFilters && (
					<button
						onClick={onClearFilters}
						className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
					>
						<X className="h-4 w-4" />
						Clear all
					</button>
				)}
			</div>

			{/* Category Filter */}
			<div>
				<h4 className="font-medium text-gray-900 mb-3">Category</h4>
				<div className="space-y-2">
					{CATEGORIES.map((category) => (
						<label key={category} className="flex items-center">
							<input
								type="radio"
								name="category"
								value={category}
								checked={filters.category === category}
								onChange={(e) =>
									onFilterChange({
										category: e.target.checked ? category : undefined,
										type: undefined, // Reset type when category changes
									})
								}
								className="h-4 w-4 text-primary-600 focus:ring-primary-500"
							/>
							<span className="ml-2 text-sm text-gray-700">{category}</span>
						</label>
					))}
				</div>
			</div>

			{/* Type Filter */}
			<div>
				<h4 className="font-medium text-gray-900 mb-3">Type</h4>
				<div className="space-y-2">
					{TYPES.map((type) => (
						<label key={type} className="flex items-center">
							<input
								type="radio"
								name="type"
								value={type}
								checked={filters.type === type}
								onChange={(e) => onFilterChange({ type: e.target.checked ? type : undefined })}
								className="h-4 w-4 text-primary-600 focus:ring-primary-500"
							/>
							<span className="ml-2 text-sm text-gray-700">{type}</span>
						</label>
					))}
				</div>
			</div>

			{/* Size Filter */}
			<div>
				<h4 className="font-medium text-gray-900 mb-3">Size</h4>
				<div className="grid grid-cols-3 gap-2">
					{SIZES.map((size) => (
						<button
							key={size}
							onClick={() => onFilterChange({ size: filters.size === size ? undefined : size })}
							className={cn(
								"px-3 py-2 text-sm rounded-lg border transition-colors",
								filters.size === size
									? "border-primary-600 bg-primary-50 text-primary-700"
									: "border-gray-300 hover:border-gray-400 text-gray-700",
							)}
						>
							{size}
						</button>
					))}
				</div>
			</div>

			{/* Condition Filter */}
			<div>
				<h4 className="font-medium text-gray-900 mb-3">Condition</h4>
				<div className="space-y-2">
					{CONDITIONS.map((condition) => {
						const pointsMap: Record<string, number> = {
							New: 50,
							"Like New": 40,
							Good: 30,
							Fair: 20,
							Poor: 10,
						};
						const points = pointsMap[condition];

						return (
							<label key={condition} className="flex items-center">
								<input
									type="radio"
									name="condition"
									value={condition}
									checked={filters.condition === condition}
									onChange={(e) => onFilterChange({ condition: e.target.checked ? condition : undefined })}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500"
								/>
								<span className="ml-2 text-sm text-gray-700 flex-1">{condition}</span>
								<span className="text-xs text-gray-500">{points} pts</span>
							</label>
						);
					})}
				</div>
			</div>
		</div>
	);
}
