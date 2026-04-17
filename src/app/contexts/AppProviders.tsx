import { AuthProvider } from "./AuthContext";
import { FinanceProvider } from "./FinanceContext";
import { UIProvider } from "./UIContext";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <UIProvider>
        <FinanceProvider>{children}</FinanceProvider>
      </UIProvider>
    </AuthProvider>
  );
};
