import { createBrowserRouter, Outlet } from "react-router";
import { createElement } from "react";
import { Layout } from "./pages/Layout";
import { Dashboard } from "./pages/Dashboard";
import { SubmitComplaint } from "./pages/SubmitComplaint";
import { Complaints } from "./pages/Complaints";
import { ComplaintDetail } from "./pages/ComplaintDetail";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import { RequireAuth, RequirePublic } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ComplaintProvider } from "./context/ComplaintContext";

function Providers() {
  return createElement(
    AuthProvider,
    null,
    createElement(ComplaintProvider, null, createElement(Outlet, null))
  );
}

export const router = createBrowserRouter([
  {
    Component: Providers,
    children: [
      { path: "/login", Component: Login },
      {
        path: "/",
        Component: RequireAuth,
        children: [
          {
            Component: Layout,
            children: [
              { index: true, Component: Dashboard },
              { path: "dashboard", Component: Dashboard },
              { path: "complaints", Component: Complaints },
              { path: "complaints/:id", Component: ComplaintDetail },
              {
                Component: RequirePublic,
                children: [
                  { path: "submit", Component: SubmitComplaint },
                  { path: "complaints/new", Component: SubmitComplaint },
                ],
              },
              { path: "*", Component: NotFound },
            ],
          },
        ],
      },
    ],
  },
]);
