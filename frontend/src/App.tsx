import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react";
import { ApiProvider } from "./contexts/ApiContext";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { BrowsePage } from "./pages/BrowsePage";
import { ItemDetailsPage } from "./pages/ItemDetailsPage";
import Login from "./pages/Login";

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isLoading, user } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}

function App() {
	return (
		<AuthKitProvider
			clientId={import.meta.env.VITE_WORKOS_CLIENT_ID}
			apiHostname={import.meta.env.VITE_WORKOS_API_HOSTNAME}
			redirectUri={import.meta.env.VITE_WORKOS_REDIRECT_URI}
		>
			<ApiProvider>
				<QueryClientProvider client={queryClient}>
					<Router>
						<Routes>
							<Route path="/" element={<LandingPage />} />
							<Route path="/login" element={<Login />} />
							<Route path="/browse" element={<BrowsePage />} />
							<Route path="/items/:id" element={<ItemDetailsPage />} />
							<Route
								path="/dashboard"
								element={
									<ProtectedRoute>
										<Dashboard />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/signup"
								element={<div className="min-h-screen flex items-center justify-center">Signup Page - Coming Soon</div>}
							/>
						</Routes>
					</Router>
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</ApiProvider>
		</AuthKitProvider>
	);
}

export default App;
