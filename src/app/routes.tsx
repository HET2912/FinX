import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ProfileSetup } from "./pages/ProfileSetup";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { Categories } from "./pages/Categories";
import { Investments } from "./pages/Investments";
import { Goals } from "./pages/Goals";
import { GroupExpense } from "./pages/GroupExpense";
import { GroupDetail } from "./pages/GroupDetail";
import { Chat } from "./pages/Chat";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import { AI } from "./pages/AI";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/profile-setup",
    Component: ProfileSetup,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/transactions",
    Component: Transactions,
  },
  {
    path: "/categories",
    Component: Categories,
  },
  {
    path: "/investments",
    Component: Investments,
  },
  {
    path: "/goals",
    Component: Goals,
  },
  {
    path: "/groups",
    Component: GroupExpense,
  },
  {
    path: "/groups/:id",
    Component: GroupDetail,
  },
  {
    path: "/chat",
    Component: Chat,
  },
  {
    path: "/notifications",
    Component: Notifications,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/ai",
    Component: AI,
  },
]);
