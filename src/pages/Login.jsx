import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await api.post("/users/login", { email, password });

      const accessToken = res.data?.data?.accessToken;
      const user = res.data?.data?.user;

      if (!accessToken) throw new Error("Token not received");

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white relative overflow-hidden font-sans selection:bg-purple-500 selection:text-white">


      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>


      <div className="relative z-10 w-full max-w-md p-8 bg-gray-800/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">


        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            ClipprX
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Welcome back, creator.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 text-white placeholder-gray-600"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot password?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 text-white placeholder-gray-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="h-px bg-gray-700 flex-1"></div>
          <span className="text-gray-500 text-xs font-medium">OR</span>
          <div className="h-px bg-gray-700 flex-1"></div>
        </div>

        <button className="mt-6 w-full py-3 bg-white/5 border border-white/5 rounded-xl font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300 transform hover:scale-[1.01]">
          Continue as Guest
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
