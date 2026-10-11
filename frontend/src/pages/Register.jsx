import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "seeker",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );

      alert("Registration successful. Please login.");

      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="box-border min-h-[calc(100vh-72px)] w-full bg-[#0b1120] px-5 py-[55px] pb-[70px] text-slate-50 max-[700px]:px-4 max-[700px]:py-[35px] max-[700px]:pb-[55px] [&>div]:mx-auto [&>div]:w-full [&>div]:max-w-[620px] [&_form]:flex [&_form]:w-full [&_form]:flex-col [&_form]:gap-5 [&_form>div]:flex [&_form>div]:w-full [&_form>div]:flex-col [&_form>div]:gap-2 [&_h1]:mb-[10px] [&_h1]:mt-0 [&_h1]:text-[32px] [&_h1]:font-extrabold [&_h1]:leading-[1.2] [&_h1]:text-slate-50 [&_h1]:max-[700px]:text-[27px] [&_p]:text-slate-400 [&_p]:leading-[1.6] [&_label]:block [&_label]:text-sm [&_label]:font-bold [&_label]:text-slate-200 [&_input]:box-border [&_input]:block [&_input]:h-12 [&_input]:min-h-12 [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-slate-700 [&_input]:bg-[#0f172a] [&_input]:px-[14px] [&_input]:text-sm [&_input]:text-slate-50 [&_input]:outline-none [&_input]:placeholder:text-slate-500 [&_input:focus]:border-teal-500 [&_input:focus]:bg-[#111827] [&_input:focus]:ring-[3px] [&_input:focus]:ring-teal-500/15 [&_select]:box-border [&_select]:block [&_select]:h-12 [&_select]:w-full [&_select]:cursor-pointer [&_select]:rounded-[10px] [&_select]:border [&_select]:border-slate-700 [&_select]:bg-[#0f172a] [&_select]:px-[14px] [&_select]:text-sm [&_select]:text-slate-50 [&_select]:outline-none [&_select:focus]:border-teal-500 [&_select:focus]:bg-[#111827] [&_select:focus]:ring-[3px] [&_select:focus]:ring-teal-500/15 [&_button]:mt-[5px] [&_button]:block [&_button]:h-[50px] [&_button]:min-h-[50px] [&_button]:w-full [&_button]:rounded-[10px] [&_button]:bg-teal-700 [&_button]:px-[18px] [&_button]:text-[15px] [&_button]:font-bold [&_button]:text-white [&_button]:transition [&_button:hover]:-translate-y-px [&_button:hover]:bg-teal-500 [&_button:hover]:shadow-[0_8px_20px_rgba(20,184,166,0.2)] [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-60 [&_a]:text-teal-300 [&_a]:no-underline [&_a:hover]:text-teal-400 [&_.register-card]:box-border [&_.register-card]:mx-auto [&_.register-card]:w-full [&_.register-card]:max-w-[620px] [&_.register-card]:rounded-[18px] [&_.register-card]:border [&_.register-card]:border-[#273449] [&_.register-card]:bg-gradient-to-br [&_.register-card]:from-[#111827] [&_.register-card]:to-[#0f172a] [&_.register-card]:p-[40px_42px] [&_.register-card]:shadow-[0_20px_50px_rgba(0,0,0,0.28)] [&_.register-card]:max-[700px]:rounded-[15px] [&_.register-card]:max-[700px]:p-[30px_22px] [&_.register-login]:mt-6 [&_.register-login]:border-t [&_.register-login]:border-[#273449] [&_.register-login]:pt-5 [&_.register-login]:text-center [&_.register-login]:text-sm [&_.register-error]:mb-[18px] [&_.register-error]:box-border [&_.register-error]:w-full [&_.register-error]:rounded-[9px] [&_.register-error]:border [&_.register-error]:border-red-400/25 [&_.register-error]:bg-red-500/10 [&_.register-error]:p-3 [&_.register-error]:text-red-400">
      <div className="register-card">
        <h1>Create your StaySync account</h1>

        <p className="register-subtitle">
          Find your perfect stay and roommate
        </p>

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">
              I want to
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="seeker">
                Find a PG / Room
              </option>

              <option value="owner">
                List my Property
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="register-login">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
