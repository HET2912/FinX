import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

type FinanceState = {
  loading: boolean;
  transactions: any[];
  stats: any;
  investments: any[];
  investmentSummary: any;
  goals: any[];
  groups: any[];
  aiInsights: any;
  categories: any[];
  unreadNotificationsCount: number;
};

type FinanceContextValue = FinanceState & {
  refreshAll: () => Promise<void>;
  createTransaction: (payload: any) => Promise<void>;
  addInvestment: (payload: any) => Promise<void>;
  updateInvestment: (id: string, payload: any) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  createGoal: (payload: any) => Promise<void>;
  addSavings: (goalId: string, amount: number) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  completeGoal: (goalId: string) => Promise<void>;
  createGroup: (payload: any) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addGroupMember: (
    groupId: string,
    payload: { userId?: string; email?: string },
  ) => Promise<any>;
  createCategory: (payload: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategory: (id: string, payload: any) => Promise<void>;
  formatCurrency: (amount: number) => string;
  getGroupDetails: (id: string) => Promise<any>;
  getGroupExpenses: (id: string) => Promise<any[]>;
  getGroupBalanceSheet: (id: string) => Promise<any>;
  addGroupExpense: (groupId: string, payload: any) => Promise<void>;
  updateGroupExpense: (expenseId: string, payload: any) => Promise<void>;
  deleteGroupExpense: (expenseId: string) => Promise<void>;
  settleGroupExpense: (expenseId: string, userId?: string) => Promise<void>;
  getChatUsers: () => Promise<any[]>;
  getChatConversations: () => Promise<any[]>;
  getChatMessages: (userId: string) => Promise<any[]>;
  sendMessage: (payload: {
    receiverId: string;
    content: string;
  }) => Promise<any>;
  deleteMessage: (messageId: string) => Promise<void>;
  clearConversation: (userId: string) => Promise<void>;
  getNotifications: (page?: number, limit?: number) => Promise<any>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getUnreadNotificationsCount: () => Promise<number>;
  refreshUnreadNotificationsCount: () => Promise<number>;
};

type FinanceAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_DATA"; payload: Partial<FinanceState> }
  | { type: "RESET" };

const FinanceContext = createContext<FinanceContextValue | undefined>(
  undefined,
);

const initialState: FinanceState = {
  loading: false,
  transactions: [],
  stats: null,
  investments: [],
  investmentSummary: null,
  goals: [],
  groups: [],
  aiInsights: null,
  categories: [],
  unreadNotificationsCount: 0,
};

const reducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_DATA":
      return { ...state, ...action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

export const FinanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshAll = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const [
        txRes,
        statsRes,
        invRes,
        invSummaryRes,
        goalsRes,
        groupsRes,
        categoriesRes,
      ] = await Promise.all([
        api.get("/transactions?limit=50"),
        api.get("/transactions/stats"),
        api.get("/investments?limit=50"),
        api.get("/investments/summary"),
        api.get("/wishlist"),
        api.get("/groups"),
        api.get("/categories"),
      ]);

      const aiRes = await api
        .post("/ai/insights", { transactions: txRes.data.transactions || [] })
        .catch(() => ({ data: { insights: null } }));

      dispatch({
        type: "SET_DATA",
        payload: {
          transactions: txRes.data.transactions || [],
          stats: statsRes.data,
          investments: invRes.data.investments || [],
          investmentSummary: invSummaryRes.data,
          goals: goalsRes.data.goals || [],
          groups: groupsRes.data.groups || [],
          aiInsights: aiRes.data.insights || null,
          categories: categoriesRes.data.categories || [],
        },
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const refreshUnreadNotificationsCount = async () => {
    const res = await api.get("/notifications/unread-count");
    const unreadNotificationsCount = res.data.unreadCount || 0;

    dispatch({
      type: "SET_DATA",
      payload: { unreadNotificationsCount },
    });

    return unreadNotificationsCount;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: "RESET" });
      return;
    }
    refreshAll().catch(() => undefined);
    refreshUnreadNotificationsCount().catch(() => undefined);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      refreshUnreadNotificationsCount().catch(() => undefined);
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const createTransaction = async (payload: any) => {
  // The interceptor handles Content-Type automatically based on payload type
  await api.post("/transactions", payload);
  await refreshAll();
};

  const addInvestment = async (payload: any) => {
    await api.post("/investments", payload);
    await refreshAll();
  };

  const updateInvestment = async (id: string, payload: any) => {
    await api.patch(`/investments/${id}`, payload);
    await refreshAll();
  };

  const deleteInvestment = async (id: string) => {
    await api.delete(`/investments/${id}`);
    await refreshAll();
  };

  const createGoal = async (payload: any) => {
    await api.post("/wishlist", payload);
    await refreshAll();
  };

  const addSavings = async (goalId: string, amount: number) => {
    await api.post(`/wishlist/${goalId}/savings`, { amount });
    await refreshAll();
  };

  const deleteGoal = async (goalId: string) => {
    await api.delete(`/wishlist/${goalId}`);
    await refreshAll();
  };

  const completeGoal = async (goalId: string) => {
    await api.patch(`/wishlist/${goalId}/complete`);
    await refreshAll();
  };

  const createGroup = async (payload: any) => {
    await api.post("/groups", payload);
    await refreshAll();
  };

  const deleteGroup = async (id: string) => {
    await api.delete(`/groups/${id}`);
    await refreshAll();
  };

  const addGroupMember = async (
    groupId: string,
    payload: { userId?: string; email?: string },
  ) => {
    const res = await api.post(`/groups/${groupId}/members`, payload);
    await refreshAll();
    return res.data.group;
  };

  const createCategory = async (payload: any) => {
    await api.post("/categories", payload);
    await refreshAll();
  };

  const updateCategory = async (id: string, payload: any) => {
    await api.patch(`/categories/${id}`, payload);
    await refreshAll();
  };

  const deleteCategory = async (id: string) => {
    await api.delete(`/categories/${id}`);
    await refreshAll();
  };

  const formatCurrency = (amount: number) => {
    const currency = user?.preferredCurrency || "INR";
    const symbol = currency === "USD" ? "$" : "₹";
    return `${symbol}${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getGroupDetails = async (id: string) => {
    const res = await api.get(`/groups/${id}`);
    return res.data.group;
  };

  const getGroupExpenses = async (id: string) => {
    const res = await api.get(`/groups/${id}/expenses`);
    return res.data.expenses;
  };

  const getGroupBalanceSheet = async (id: string) => {
    const res = await api.get(`/groups/${id}/balance-sheet`);
    return res.data;
  };

  const addGroupExpense = async (groupId: string, payload: any) => {
    await api.post(`/groups/${groupId}/expenses`, payload);
    await refreshAll();
  };

  const updateGroupExpense = async (expenseId: string, payload: any) => {
    await api.patch(`/groups/expenses/${expenseId}`, payload);
    await refreshAll();
  };

  const deleteGroupExpense = async (expenseId: string) => {
    await api.delete(`/groups/expenses/${expenseId}`);
    await refreshAll();
  };

  const settleGroupExpense = async (expenseId: string, userId?: string) => {
    await api.patch(`/groups/expenses/${expenseId}/settle`, { userId });
    await refreshAll();
  };

  const getChatUsers = async () => {
    const res = await api.get("/messages/users");
    return res.data.users;
  };

  const getChatConversations = async () => {
    const res = await api.get("/messages/conversations");
    return res.data.conversations;
  };

  const getChatMessages = async (userId: string) => {
    const res = await api.get(`/messages/${userId}`);
    return res.data.messages;
  };

  const sendMessage = async ({
    receiverId,
    content,
  }: {
    receiverId: string;
    content: string;
  }) => {
    const res = await api.post("/messages", { receiverId, content });
    return res.data.message;
  };

  const deleteMessage = async (messageId: string) => {
    await api.delete(`/messages/messages/${messageId}`);
  };

  const clearConversation = async (userId: string) => {
    await api.delete(`/messages/conversations/${userId}`);
  };

  const getNotifications = async (page = 1, limit = 20) => {
    const res = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return res.data;
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await api.patch(`/notifications/${notificationId}/read`);
    await refreshUnreadNotificationsCount();
  };

  const markAllNotificationsAsRead = async () => {
    await api.patch("/notifications/read-all");
    await refreshUnreadNotificationsCount();
  };

  const deleteNotification = async (notificationId: string) => {
    await api.delete(`/notifications/${notificationId}`);
    await refreshUnreadNotificationsCount();
  };

  const getUnreadNotificationsCount = async () => {
    return refreshUnreadNotificationsCount();
  };

  const value = useMemo<FinanceContextValue>(
    () => ({
      ...state,
      refreshAll,
      createTransaction,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      createGoal,
      addSavings,
      deleteGoal,
      completeGoal,
      createGroup,
      deleteGroup,
      addGroupMember,
      createCategory,
      updateCategory,
      deleteCategory,
      formatCurrency,
      getGroupDetails,
      getGroupExpenses,
      getGroupBalanceSheet,
      addGroupExpense,
      updateGroupExpense,
      deleteGroupExpense,
      settleGroupExpense,
      getChatUsers,
      getChatConversations,
      getChatMessages,
      sendMessage,
      deleteMessage,
      clearConversation,
      getNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      getUnreadNotificationsCount,
      refreshUnreadNotificationsCount,
    }),
    [state, user?.preferredCurrency],
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return context;
};
