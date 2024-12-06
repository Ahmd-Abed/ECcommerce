import { Provider } from "react-redux";
import { store } from "./redux/store/store";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import { DisplayMode } from "@microsoft/sp-core-library";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import React from "react";
import HomePage from "./components/HomePage";
import SignUp from "./components/Signup";

// Authentication checker
const isAuthenticated = () => !!localStorage.getItem("user");

// PrivateRoute Component
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp {...props} />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
