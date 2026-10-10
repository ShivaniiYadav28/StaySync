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
import OwnerDashboard from "./pages/OwnerDashboard";

import Favorites from "./pages/Favorites";
import MyInquiries from "./pages/MyInquiries";

import Messages from "./pages/Messages";
import Booking from "./pages/Booking";

import Roommates from "./pages/Roommates";
import CreateRoommateProfile from "./pages/CreateRoommateProfile";
import RoommateRequests from "./pages/RoommateRequests";

import EditProperty from "./pages/EditProperty";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
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

        <Route element={<ProtectedRoute />}>
          <Route
            path="/owner/dashboard"
            element={<OwnerDashboard />}
          />

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

          <Route
            path="/favorites"
            element={<Favorites />}
          />

          <Route
            path="/my-inquiries"
            element={<MyInquiries />}
          />

          <Route
            path="/messages"
            element={<Messages />}
          />
          <Route
            path="/properties/:id/book"
            element={<Booking />}
          />

          <Route
            path="/roommates"
            element={<Roommates />}
          />

          <Route
            path="/roommates/create"
            element={<CreateRoommateProfile />}
          />

          <Route
            path="/roommate-requests"
            element={<RoommateRequests />}
          />

          <Route
            path="/owner/properties/:id/edit"
            element={<EditProperty />}
          />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;