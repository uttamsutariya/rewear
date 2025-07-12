import { Mail, Calendar, Award, Package, ArrowLeftRight, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { formatDate } from "../../lib/utils";
import type { User, PointTransaction } from "../../types";

interface ProfileSectionProps {
	profile: User;
	stats: {
		totalItems: number;
		availableItems: number;
		pendingItems: number;
		swappedItems: number;
		totalSwapsCompleted: number;
		pendingSwapRequests: {
			sent: number;
			received: number;
		};
	};
	recentTransactions?: PointTransaction[];
}

export function ProfileSection({ profile, stats, recentTransactions = [] }: ProfileSectionProps) {
	// Calculate total points earned and redeemed from transactions
	const totalEarned = recentTransactions.filter((t) => t.type === "EARNED").reduce((sum, t) => sum + t.amount, 0);

	const totalRedeemed = recentTransactions
		.filter((t) => t.type === "REDEEMED")
		.reduce((sum, t) => sum + Math.abs(t.amount), 0);

	return (
		<div className="p-8">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

			{/* User Info Card */}
			<div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 mb-8">
				<div className="flex items-center gap-6">
					<div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
						{profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase()}
					</div>
					<div>
						<h3 className="text-2xl font-bold text-gray-900">{profile?.name || "User"}</h3>
						<div className="flex items-center gap-2 text-gray-600 mt-1">
							<Mail className="h-4 w-4" />
							<span>{profile?.email}</span>
						</div>
						<div className="flex items-center gap-2 text-gray-600 mt-1">
							<Calendar className="h-4 w-4" />
							<span>Member since {profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Activity Stats */}
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="border border-gray-200 rounded-lg p-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-600">Points Earned</span>
							<Award className="h-5 w-5 text-yellow-500" />
						</div>
						<p className="text-2xl font-bold text-gray-900">{totalEarned}</p>
						<p className="text-xs text-gray-500 mt-1">From giving items</p>
					</div>

					<div className="border border-gray-200 rounded-lg p-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-600">Points Redeemed</span>
							<Package className="h-5 w-5 text-purple-500" />
						</div>
						<p className="text-2xl font-bold text-gray-900">{totalRedeemed}</p>
						<p className="text-xs text-gray-500 mt-1">On new items</p>
					</div>

					<div className="border border-gray-200 rounded-lg p-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-600">Total Swaps</span>
							<ArrowLeftRight className="h-5 w-5 text-green-500" />
						</div>
						<p className="text-2xl font-bold text-gray-900">{stats.totalSwapsCompleted}</p>
						<p className="text-xs text-gray-500 mt-1">Items exchanged</p>
					</div>
				</div>
			</div>

			{/* Item Status Breakdown */}
			<div className="mt-8">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Item Status</h3>
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-600">Available</span>
						<span className="text-sm font-medium text-green-600">{stats.availableItems} items</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-600">Pending Approval</span>
						<span className="text-sm font-medium text-yellow-600">{stats.pendingItems} items</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-600">Swapped</span>
						<span className="text-sm font-medium text-blue-600">{stats.swappedItems} items</span>
					</div>
				</div>
			</div>

			{/* Recent Transactions */}
			{recentTransactions.length > 0 && (
				<div className="mt-8">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Point Transactions</h3>
					<div className="space-y-2">
						{recentTransactions.slice(0, 5).map((transaction) => (
							<div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div className="flex items-center gap-3">
									{transaction.type === "EARNED" ? (
										<div className="p-2 bg-green-100 rounded-full">
											<TrendingUp className="h-4 w-4 text-green-600" />
										</div>
									) : (
										<div className="p-2 bg-red-100 rounded-full">
											<TrendingDown className="h-4 w-4 text-red-600" />
										</div>
									)}
									<div>
										<p className="text-sm font-medium text-gray-900">
											{transaction.type === "EARNED" ? "Points Earned" : "Points Redeemed"}
										</p>
										{transaction.item && <p className="text-xs text-gray-500">{transaction.item.title}</p>}
									</div>
								</div>
								<div className="text-right">
									<p
										className={`text-sm font-semibold ${
											transaction.type === "EARNED" ? "text-green-600" : "text-red-600"
										}`}
									>
										{transaction.type === "EARNED" ? "+" : "-"}
										{Math.abs(transaction.amount)}
									</p>
									<p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
