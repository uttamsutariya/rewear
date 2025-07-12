import { Navigate } from "react-router-dom";
import { useAuth } from "@workos-inc/authkit-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api-client";
import { Loader2 } from "lucide-react";

const ADMIN_EMAIL = "uttamsutariya.dev@gmail.com";

interface AdminRouteProps {
	children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
	const { isLoading: authLoading, user: workosUser } = useAuth();

	const { data, isLoading } = useQuery({
		queryKey: ["user", workosUser?.email],
		queryFn: () => api.users.profile(),
		enabled: !!workosUser,
		retry: false,
	});

	// Show loading state
	if (authLoading || isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary-600" />
			</div>
		);
	}

	// Not authenticated
	if (!workosUser || !data?.data) {
		return <Navigate to="/auth" replace />;
	}

	// Check if user is admin by email
	if (data.data.email !== ADMIN_EMAIL) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}
