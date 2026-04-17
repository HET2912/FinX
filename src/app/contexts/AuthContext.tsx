import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { api } from "../lib/api";

type AuthUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  profilePicture?: string;
  preferredCurrency?: string;
  monthlyIncome?: number;
  incomeSource?: string;
  phoneNumber?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  updateProfile: (payload: Partial<AuthUser>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
};

type AuthAction =
  | { type: "INIT"; payload: { token: string | null } }
  | { type: "SUCCESS"; payload: { user: AuthUser; token: string } }
  | { type: "SET_USER"; payload: { user: AuthUser | null } }
  | { type: "LOGOUT" };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "INIT":
      return { ...state, token: action.payload.token, loading: false };
    case "SUCCESS":
      return {
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case "SET_USER":
      return { ...state, user: action.payload.user, loading: false };
    case "LOGOUT":
      return { user: null, token: null, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    loading: true,
  });

  const refreshMe = async () => {
    const response = await api.get("/auth/me");
    dispatch({ type: "SET_USER", payload: { user: response.data.user } });
  };

  useEffect(() => {
    const token = localStorage.getItem("finx_token");
    dispatch({ type: "INIT", payload: { token } });
    if (!token) return;

    refreshMe().catch(() => {
      localStorage.removeItem("finx_token");
      dispatch({ type: "LOGOUT" });
    });
  }, []);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post("/auth/login", { email, password });
    const token = response.data.accessToken;
    localStorage.setItem("finx_token", token);
    dispatch({ type: "SUCCESS", payload: { user: response.data.user, token } });
  };

  const signup = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", { name, email, password });
    const token = response.data.accessToken;
    localStorage.setItem("finx_token", token);
    dispatch({ type: "SUCCESS", payload: { user: response.data.user, token } });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("finx_token");
      dispatch({ type: "LOGOUT" });
      window.location.href = "/login";
    }
  };

  const updateProfile = async (payload: Partial<AuthUser>) => {
    const response = await api.patch("/users/profile", payload);
    dispatch({ type: "SET_USER", payload: { user: response.data.user } });
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    dispatch({ type: "SET_USER", payload: { user: response.data.user } });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      token: state.token,
      loading: state.loading,
      isAuthenticated: Boolean(state.token),
      login,
      signup,
      logout,
      refreshMe,
      updateProfile,
      uploadAvatar,
    }),
    [state.user, state.token, state.loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
