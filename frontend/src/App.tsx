import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiProvider } from "./contexts/ApiContext";
import { LandingPage } from "./pages/LandingPage";
import { AuthKitProvider } from "@workos-inc/authkit-react";
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
							{/* Add more routes as we build them */}
							<Route
								path="/browse"
								element={<div className="min-h-screen flex items-center justify-center">Browse Page - Coming Soon</div>}
							/>
							<Route
								path="/signup"
								element={<div className="min-h-screen flex items-center justify-center">Signup Page - Coming Soon</div>}
							/>
							<Route
								path="/dashboard"
								element={<div className="min-h-screen flex items-center justify-center">Dashboard - Coming Soon</div>}
							/>
							<Route
								path="/items/:id"
								element={<div className="min-h-screen flex items-center justify-center">Item Detail - Coming Soon</div>}
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
