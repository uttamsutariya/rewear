import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@workos-inc/authkit-react";
import {
	User,
	Package,
	Upload,
	Settings,
	LogOut,
	Coins,
	TrendingUp,
	ShoppingBag,
	Clock,
	AlertCircle,
} from "lucide-react";
import { api } from "../lib/api-client";
import { ProfileSection } from "../components/dashboard/ProfileSection";
import { cn } from "../lib/utils";
import { ItemsSection } from "../components/dashboard/ItemsSection";
import { UploadItemForm } from "../components/dashboard/UploadItemForm";

type TabType = "profile" | "items" | "upload";

export function Dashboard() {
	const [activeTab, setActiveTab] = useState<TabType>("profile");
	const { user: authUser } = useAuth();

	// Fetch dashboard data
	const {
		data: dashboardData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => api.dashboard.get(),
	});

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	if (error || !dashboardData?.success) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<p className="text-gray-600">Failed to load dashboard data</p>
				</div>
			</div>
		);
	}

	const { profile, stats, recentActivity } = dashboardData.data;

	const navigationItems = [
		{
			id: "profile" as TabType,
			label: "Profile",
			icon: User,
			badge: null,
		},
		{
			id: "items" as TabType,
			label: "My Items",
			icon: Package,
			badge: stats.items.total || 0,
		},
		{
			id: "upload" as TabType,
			label: "Upload Item",
			icon: Upload,
			badge: null,
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="flex">
				{/* Sidebar */}
				<aside className="w-64 min-h-screen bg-white shadow-lg">
					<div className="p-6">
						<h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
					</div>

					<nav className="px-4 pb-6">
						{navigationItems.map((item) => (
							<button
								key={item.id}
								onClick={() => setActiveTab(item.id)}
								className={cn(
									"w-full flex items-center justify-between px-4 py-3 mb-2 rounded-lg transition-all duration-200",
									activeTab === item.id
										? "bg-primary-50 text-primary-700 shadow-sm"
										: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
								)}
							>
								<div className="flex items-center gap-3">
									<item.icon className="h-5 w-5" />
									<span className="font-medium">{item.label}</span>
								</div>
								{item.badge !== null && (
									<span
										className={cn(
											"text-xs px-2 py-1 rounded-full",
											activeTab === item.id ? "bg-primary-200 text-primary-800" : "bg-gray-200 text-gray-700",
										)}
									>
										{item.badge}
									</span>
								)}
							</button>
						))}

						<hr className="my-6 border-gray-200" />

						<button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200">
							<Settings className="h-5 w-5" />
							<span className="font-medium">Settings</span>
						</button>

						<button
							onClick={() => {
								// Handle logout
								window.location.href = "/";
							}}
							className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
						>
							<LogOut className="h-5 w-5" />
							<span className="font-medium">Logout</span>
						</button>
					</nav>
				</aside>

				{/* Main Content */}
				<main className="flex-1 p-8">
					{/* Quick Stats */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-medium text-gray-600">Points Balance</h3>
								<Coins className="h-5 w-5 text-primary-600" />
							</div>
							<p className="text-3xl font-bold text-gray-900">{profile?.points || 0}</p>
							<p className="text-xs text-gray-500 mt-1">Available to redeem</p>
						</div>

						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-medium text-gray-600">Items Listed</h3>
								<Package className="h-5 w-5 text-blue-600" />
							</div>
							<p className="text-3xl font-bold text-gray-900">{stats.items.total}</p>
							<p className="text-xs text-gray-500 mt-1">{stats.items.available} available</p>
						</div>

						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-medium text-gray-600">Swaps Completed</h3>
								<TrendingUp className="h-5 w-5 text-green-600" />
							</div>
							<p className="text-3xl font-bold text-gray-900">{stats.swaps.completed}</p>
							<p className="text-xs text-gray-500 mt-1">Total exchanges</p>
						</div>

						<div className="bg-white rounded-xl shadow-sm p-6">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-medium text-gray-600">Pending Requests</h3>
								<Clock className="h-5 w-5 text-orange-600" />
							</div>
							<p className="text-3xl font-bold text-gray-900">
								{stats.swaps.received.pending + stats.swaps.sent.pending}
							</p>
							<p className="text-xs text-gray-500 mt-1">Awaiting response</p>
						</div>
					</div>

					{/* Tab Content */}
					<div className="bg-white rounded-xl shadow-sm">
						{activeTab === "profile" && <ProfileSection profile={profile} stats={stats} />}
						{activeTab === "items" && <ItemsSection items={recentActivity.items} />}
						{activeTab === "upload" && <UploadItemForm />}
					</div>
				</main>
			</div>
		</div>
	);
}
