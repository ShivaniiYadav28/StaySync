import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        email.trim(),
        password
      );

      const loggedInUser =
        response?.data?.user;

      if (loggedInUser?.role === "owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] box-border bg-[#0b1120] px-6 py-[70px] pb-20 max-[550px]:px-4 max-[550px]:py-10 max-[550px]:pb-[60px]">
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-[1fr_480px] items-center gap-20 max-[900px]:max-w-[650px] max-[900px]:grid-cols-1 max-[900px]:gap-[45px]">
        <div className="text-slate-50 max-[900px]:text-center">
          <div className="mx-auto mb-[22px] flex h-12 w-12 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-500/10 text-[23px]">
            🏠
          </div>

          <p className="mb-3 text-[13px] font-extrabold tracking-[2px] text-teal-300">
            STAYSYNC
          </p>

          <h1 className="m-0 text-5xl font-extrabold leading-[1.12] tracking-tight max-[550px]:text-4xl">
            Find your perfect
            <br />
            <span className="text-teal-400">stay.</span>
          </h1>

          <p className="mx-0 my-[22px] mb-[30px] max-w-[560px] text-base leading-[1.7] text-slate-400 max-[900px]:mx-auto max-[550px]:text-[15px]">
            Discover comfortable PGs, rooms and
            compatible roommates with StaySync.
          </p>

          <div className="flex flex-col gap-4 max-[900px]:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border border-teal-300/20 bg-teal-500/10 text-[13px] font-extrabold text-teal-300">✓</span>
              <p className="m-0 text-sm leading-[1.5] text-slate-300">Verified properties</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border border-teal-300/20 bg-teal-500/10 text-[13px] font-extrabold text-teal-300">✓</span>
              <p className="m-0 text-sm leading-[1.5] text-slate-300">Find compatible roommates</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border border-teal-300/20 bg-teal-500/10 text-[13px] font-extrabold text-teal-300">✓</span>
              <p className="m-0 text-sm leading-[1.5] text-slate-300">Connect directly with owners</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border border-teal-300/20 bg-teal-500/10 text-[13px] font-extrabold text-teal-300">✓</span>
              <p className="m-0 text-sm leading-[1.5] text-slate-300">Find a stay that suits you</p>
            </div>
          </div>
        </div>

        <div className="mx-auto box-border w-full max-w-[520px] rounded-[17px] border border-[#273449] bg-gradient-to-br from-[#111827] to-[#0f172a] p-[38px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] max-[550px]:px-[22px] max-[550px]:py-7">
          <div className="mb-7">
            <h2 className="mb-2 mt-0 text-[32px] font-extrabold leading-[1.2] text-slate-50 max-[550px]:text-[27px]">Welcome back</h2>

            <p className="m-0 text-sm leading-[1.6] text-slate-400">
              Sign in to continue to StaySync.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-400/25 bg-red-500/10 px-3.5 py-3 text-[13px] leading-[1.5] text-red-400">
              {error}
            </div>
          )}

          <form
            className="flex flex-col gap-[19px]"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-100" htmlFor="email">
                Email Address
              </label>

              <input
                className="box-border w-full rounded-[9px] border border-slate-700 bg-[#0f172a] px-[15px] py-3.5 text-sm text-slate-50 outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-teal-500 focus:bg-[#111827] focus:ring-[3px] focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:opacity-65"
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-100" htmlFor="password">
                Password
              </label>

              <input
                className="box-border w-full rounded-[9px] border border-slate-700 bg-[#0f172a] px-[15px] py-3.5 text-sm text-slate-50 outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-teal-500 focus:bg-[#111827] focus:ring-[3px] focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:opacity-65"
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="mt-[5px] w-full rounded-[9px] border border-teal-700 bg-teal-700 px-[18px] py-3.5 text-sm font-bold text-white transition hover:enabled:-translate-y-px hover:enabled:border-teal-500 hover:enabled:bg-teal-500 hover:enabled:shadow-[0_8px_20px_rgba(20,184,166,0.2)] active:enabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-[25px] border-t border-[#273449] pt-5 text-center text-sm text-slate-400">
            <span>
              Don't have an account?
            </span>{" "}
            <Link className="font-bold text-teal-300 no-underline hover:text-teal-400 hover:underline" to="/register">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
