import { createContext, useContext, useMemo, useReducer } from "react";

type UIState = {
  modals: Record<string, boolean>;
  notifications: Array<{
    id: string;
    message: string;
    type: "info" | "success" | "error";
  }>;
  sidebarOpen: boolean;
};

type UIContextValue = {
  modals: UIState["modals"];
  notifications: UIState["notifications"];
  sidebarOpen: boolean;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  pushNotification: (
    message: string,
    type?: "info" | "success" | "error",
  ) => void;
  clearNotification: (id: string) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

type UIAction =
  | { type: "OPEN_MODAL"; payload: { id: string } }
  | { type: "CLOSE_MODAL"; payload: { id: string } }
  | {
      type: "PUSH_NOTIFICATION";
      payload: {
        id: string;
        message: string;
        type: "info" | "success" | "error";
      };
    }
  | { type: "CLEAR_NOTIFICATION"; payload: { id: string } }
  | { type: "OPEN_SIDEBAR" }
  | { type: "CLOSE_SIDEBAR" }
  | { type: "TOGGLE_SIDEBAR" };

const UIContext = createContext<UIContextValue | undefined>(undefined);

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "OPEN_MODAL":
      return {
        ...state,
        modals: { ...state.modals, [action.payload.id]: true },
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        modals: { ...state.modals, [action.payload.id]: false },
      };
    case "PUSH_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case "CLEAR_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (item) => item.id !== action.payload.id,
        ),
      };
    case "OPEN_SIDEBAR":
      return { ...state, sidebarOpen: true };
    case "CLOSE_SIDEBAR":
      return { ...state, sidebarOpen: false };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    default:
      return state;
  }
};

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(uiReducer, {
    modals: {},
    notifications: [],
    sidebarOpen: false,
  });

  const value = useMemo<UIContextValue>(
    () => ({
      modals: state.modals,
      notifications: state.notifications,
      sidebarOpen: state.sidebarOpen,
      openModal: (id) => dispatch({ type: "OPEN_MODAL", payload: { id } }),
      closeModal: (id) => dispatch({ type: "CLOSE_MODAL", payload: { id } }),
      pushNotification: (message, type = "info") =>
        dispatch({
          type: "PUSH_NOTIFICATION",
          payload: { id: `${Date.now()}_${Math.random()}`, message, type },
        }),
      clearNotification: (id) =>
        dispatch({ type: "CLEAR_NOTIFICATION", payload: { id } }),
      openSidebar: () => dispatch({ type: "OPEN_SIDEBAR" }),
      closeSidebar: () => dispatch({ type: "CLOSE_SIDEBAR" }),
      toggleSidebar: () => dispatch({ type: "TOGGLE_SIDEBAR" }),
    }),
    [state.modals, state.notifications, state.sidebarOpen],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
};
