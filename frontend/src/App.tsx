import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LandingPage } from "./pages/LandingPage";

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
		<QueryClientProvider client={queryClient}>
			<Router>
				<Routes>
					<Route path="/" element={<LandingPage />} />
					{/* Add more routes as we build them */}
					<Route
						path="/browse"
						element={<div className="min-h-screen flex items-center justify-center">Browse Page - Coming Soon</div>}
					/>
					<Route
						path="/how-it-works"
						element={<div className="min-h-screen flex items-center justify-center">How It Works - Coming Soon</div>}
					/>
					<Route
						path="/about"
						element={<div className="min-h-screen flex items-center justify-center">About - Coming Soon</div>}
					/>
					<Route
						path="/login"
						element={<div className="min-h-screen flex items-center justify-center">Login - Coming Soon</div>}
					/>
					<Route
						path="/signup"
						element={<div className="min-h-screen flex items-center justify-center">Sign Up - Coming Soon</div>}
					/>
					<Route
						path="/items/:id"
						element={<div className="min-h-screen flex items-center justify-center">Item Detail - Coming Soon</div>}
					/>
				</Routes>
			</Router>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}

export default App;
