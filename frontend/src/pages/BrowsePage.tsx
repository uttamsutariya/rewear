import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X, ChevronDown, ChevronUp, Loader2, Package, Heart, Eye, Coins } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api-client";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ItemCard } from "../components/browse/ItemCard";

import { cn } from "../lib/utils";
import { FilterSidebar } from "../components/browse/FilterSidebar";

interface FilterState {
	category?: string;
	type?: string;
	size?: string;
	condition?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export function BrowsePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [showFilters, setShowFilters] = useState(false);
	const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

	const page = parseInt(searchParams.get("page") || "1");

	const filters: FilterState = {
		category: searchParams.get("category") || undefined,
		type: searchParams.get("type") || undefined,
		size: searchParams.get("size") || undefined,
		condition: searchParams.get("condition") || undefined,
		search: searchParams.get("search") || undefined,
		sortBy: searchParams.get("sortBy") || "createdAt",
		sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
	};

	// Fetch items
	const { data, isLoading, error } = useQuery({
		queryKey: ["items", page, filters],
		queryFn: () =>
			api.items.list({
				page,
				limit: 12,
				...filters,
			}),
	});

	// Handle filter changes
	const updateFilters = (newFilters: Partial<FilterState>) => {
		const params = new URLSearchParams(searchParams);

		Object.entries(newFilters).forEach(([key, value]) => {
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		});

		// Reset to page 1 when filters change
		params.set("page", "1");
		setSearchParams(params);
	};

	// Handle search
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		updateFilters({ search: searchInput || undefined });
	};

	// Handle pagination
	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams);
		params.set("page", newPage.toString());
		setSearchParams(params);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const items = data?.data?.items || [];
	const pagination = data?.data?.pagination;

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="pt-20">
				{/* Hero Section */}
				<div className="bg-gradient-to-r from-primary-50 to-secondary-50 py-12">
					<div className="container mx-auto px-4">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Items</h1>
						<p className="text-lg text-gray-600 mb-8">Discover amazing pre-loved fashion from our community</p>

						{/* Search Bar */}
						<form onSubmit={handleSearch} className="max-w-2xl">
							<div className="relative">
								<input
									type="text"
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									placeholder="Search for items..."
									className="w-full px-12 py-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
								<button
									type="submit"
									className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors"
								>
									Search
								</button>
							</div>
						</form>
					</div>
				</div>

				<div className="container mx-auto px-4 py-8">
					<div className="flex gap-8">
						{/* Filters Sidebar - Desktop */}
						<aside className="hidden lg:block w-64 flex-shrink-0">
							<FilterSidebar
								filters={filters}
								onFilterChange={updateFilters}
								onClearFilters={() => {
									setSearchParams({});
									setSearchInput("");
								}}
							/>
						</aside>

						{/* Main Content */}
						<div className="flex-1">
							{/* Filter Bar */}
							<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<button
											onClick={() => setShowFilters(!showFilters)}
											className="lg:hidden flex items-center gap-2 text-gray-700 hover:text-primary-600"
										>
											<Filter className="h-5 w-5" />
											Filters
										</button>

										<span className="text-sm text-gray-600">{pagination?.total || 0} items found</span>
									</div>

									{/* Sort Options */}
									<div className="flex items-center gap-2">
										<label className="text-sm text-gray-600">Sort by:</label>
										<select
											value={`${filters.sortBy}-${filters.sortOrder}`}
											onChange={(e) => {
												const [sortBy, sortOrder] = e.target.value.split("-");
												updateFilters({ sortBy, sortOrder: sortOrder as "asc" | "desc" });
											}}
											className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
										>
											<option value="createdAt-desc">Newest First</option>
											<option value="createdAt-asc">Oldest First</option>
											<option value="title-asc">Name (A-Z)</option>
											<option value="title-desc">Name (Z-A)</option>
										</select>
									</div>
								</div>

								{/* Mobile Filters */}
								{showFilters && (
									<div className="lg:hidden mt-4 pt-4 border-t">
										<FilterSidebar
											filters={filters}
											onFilterChange={updateFilters}
											onClearFilters={() => {
												setSearchParams({});
												setSearchInput("");
											}}
											mobile
										/>
									</div>
								)}
							</div>

							{/* Items Grid */}
							{isLoading ? (
								<div className="flex justify-center items-center h-96">
									<Loader2 className="h-8 w-8 animate-spin text-primary-600" />
								</div>
							) : error ? (
								<div className="text-center py-12">
									<Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
									<p className="text-gray-600">Failed to load items. Please try again.</p>
								</div>
							) : items.length === 0 ? (
								<div className="text-center py-12">
									<Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
									<p className="text-gray-600">Try adjusting your filters or search terms</p>
								</div>
							) : (
								<>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{items.map((item) => (
											<ItemCard key={item.id} item={item} />
										))}
									</div>

									{/* Pagination */}
									{pagination && pagination.pages > 1 && (
										<div className="mt-8 flex justify-center">
											<div className="flex items-center gap-2">
												<button
													onClick={() => handlePageChange(page - 1)}
													disabled={page === 1}
													className={cn(
														"px-4 py-2 rounded-lg transition-colors",
														page === 1
															? "bg-gray-100 text-gray-400 cursor-not-allowed"
															: "bg-white text-gray-700 hover:bg-gray-100 shadow-sm",
													)}
												>
													Previous
												</button>

												<div className="flex items-center gap-1">
													{Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
														let pageNum;
														if (pagination.pages <= 5) {
															pageNum = i + 1;
														} else if (page <= 3) {
															pageNum = i + 1;
														} else if (page >= pagination.pages - 2) {
															pageNum = pagination.pages - 4 + i;
														} else {
															pageNum = page - 2 + i;
														}

														return (
															<button
																key={pageNum}
																onClick={() => handlePageChange(pageNum)}
																className={cn(
																	"w-10 h-10 rounded-lg transition-colors",
																	page === pageNum
																		? "bg-primary-600 text-white"
																		: "bg-white text-gray-700 hover:bg-gray-100 shadow-sm",
																)}
															>
																{pageNum}
															</button>
														);
													})}
												</div>

												<button
													onClick={() => handlePageChange(page + 1)}
													disabled={page === pagination.pages}
													className={cn(
														"px-4 py-2 rounded-lg transition-colors",
														page === pagination.pages
															? "bg-gray-100 text-gray-400 cursor-not-allowed"
															: "bg-white text-gray-700 hover:bg-gray-100 shadow-sm",
													)}
												>
													Next
												</button>
											</div>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
