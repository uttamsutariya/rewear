import React, { createContext, useContext, useEffect } from "react";
import { apiService } from "../lib/api-service";
import { useAuth } from "@workos-inc/authkit-react";

const ApiContext = createContext<typeof apiService | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
	const { getAccessToken, signOut } = useAuth();
	useEffect(() => {
		apiService.setAuthTokenGetter(getAccessToken);
		apiService.setSignOutFunction(signOut);
	}, [getAccessToken, signOut]);

	return <ApiContext.Provider value={apiService}>{children}</ApiContext.Provider>;
}

export function useApi() {
	const context = useContext(ApiContext);
	if (!context) {
		throw new Error("useApi must be used within an ApiProvider");
	}
	return context;
}

export { apiService };
