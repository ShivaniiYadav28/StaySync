import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";

import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";
import OwnerInquiries from "./pages/OwnerInquiries";

import Favorites from "./pages/Favorites";
import MyInquiries from "./pages/MyInquiries";

import Messages from "./pages/Messages";

import Roommates from "./pages/Roommates";

import "./App.css";


function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* ==========================================
            PUBLIC ROUTES
            ========================================== */}

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


        {/* ==========================================
            PROTECTED ROUTES
            ========================================== */}

        <Route element={<ProtectedRoute />}>

          {/* ----------------------------------------
              OWNER ROUTES
              ---------------------------------------- */}

          <Route
            path="/owner/add-property"
            element={<AddProperty />}
          />

          <Route
            path="/owner/my-properties"
            element={<MyProperties />}
          />

          <Route
            path="/owner/inquiries"
            element={<OwnerInquiries />}
          />


          {/* ----------------------------------------
              SEEKER ROUTES
              ---------------------------------------- */}

          <Route
            path="/favorites"
            element={<Favorites />}
          />

          <Route
            path="/my-inquiries"
            element={<MyInquiries />}
          />


          {/* ----------------------------------------
              MESSAGING
              ---------------------------------------- */}

          <Route
            path="/messages"
            element={<Messages />}
          />


          {/* ----------------------------------------
              ROOMMATE MATCHING
              ---------------------------------------- */}

          <Route
            path="/roommates"
            element={<Roommates />}
          />

          {/* 
            The individual roommate profile page
            will be added later.

            Example future route:
            /roommates/:id
          */}

        </Route>

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}

export default App;