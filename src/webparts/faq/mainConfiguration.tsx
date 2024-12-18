import { Provider } from "react-redux";
import { store } from "./redux/store/store";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import { DisplayMode } from "@microsoft/sp-core-library";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import React from "react";
import HomePage from "./components/HomePage";
import SignUp from "./components/Signup";
import Navbar from "./components/Navbar";
import styles from "./components/Faq.module.scss";
import Cart from "./components/cart";

// Authentication checker
const isAuthenticated = (): boolean => {
  const user = localStorage.getItem("user");
  return !!user; // Returns true if a user exists, false otherwise
};
console.log(" ya m3alem Is User Authenticated: ", isAuthenticated());
// Private Route Wrapper
const PrivateRoute = ({ children }: { children: JSX.Element }): JSX.Element => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// App Component
function App(props: {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
  listGuid: string;
  title: string;
  displayMode: DisplayMode;
  updateProperty: (value: string) => void;
}) {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Render main app structure */}
          <Route path="/*" element={<AppWithNavbar {...props} />} />
        </Routes>
      </Router>
    </Provider>
  );
}

const AppWithNavbar = (props: any) => {
  const location = useLocation();

  // Check if the current path is /login or /signup
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className={styles.all}>
      {/* Render Navbar if not on login or signup page */}
      {!isAuthPage && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp {...props} />} />

        {/* Private Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route
          path="*"
          element={
            isAuthenticated() ? (
              <Navigate to="/home" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
