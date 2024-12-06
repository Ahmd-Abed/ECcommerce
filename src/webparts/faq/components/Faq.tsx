// import React from "react";
// import {
//   BrowserRouter as Router,
//   Route,
//   Routes,
//   Link,
//   Navigate,
// } from "react-router-dom";
// import Signup from "./SignUp";
// import LoginPage from "./LoginPage";
// import Home from "./HomePage";
// import styles from "./Faq.module.scss";
// import { IFaqProps } from "./IFaqProps";
// const isAuthenticated = () => !!localStorage.getItem("user");
// const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
//   return isAuthenticated() ? children : <Navigate to="/login" />;
// };
// const Faq = (props: IFaqProps) => {
//   return (
//     <Router>
//       <div className={styles.faqContainer}>
//         {/* Navigation */}
//         <nav>
//           <ul>
//             <li>
//               <Link to="/home">Home</Link>
//             </li>
//             <li>
//               <Link to="/signup">Signup</Link>
//             </li>
//             <li>
//               <Link to="/login">Login</Link>
//             </li>
//           </ul>
//         </nav>

//         {/* Define Routes */}
//         <Routes>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<Signup {...props} />} />
//           <Route
//             path="/home"
//             element={
//               <PrivateRoute>
//                 <Home />
//               </PrivateRoute>
//             }
//           />
//           <Route path="*" element={<Navigate to="/login" />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// };

// export default Faq;
