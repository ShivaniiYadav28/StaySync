import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import AuthProvider from "./context/AuthContext.jsx";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Navbar />

        <Routes>

          {/* ==========================
              PUBLIC ROUTES
          ========================== */}

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/properties"
            element={<Properties />}
          />

          <Route
            path="/properties/:id"
            element={<PropertyDetails />}
          />


          {/* ==========================
              PROTECTED ROUTES
          ========================== */}

          <Route element={<ProtectedRoute />}>

            <Route
              path="/owner/add-property"
              element={<AddProperty />}
            />

            <Route
              path="/owner/my-properties"
              element={<MyProperties />}
            />

          </Route>

        </Routes>

        <Footer />

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;