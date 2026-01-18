import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const AppNavbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-300 ${isActive
      ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-500 after:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
      : "text-gray-400 hover:text-white hover:after:w-full"
    } after:transition-all after:duration-300 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-500`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              ClipprX
            </span>
          </div>




          <div className="hidden md:flex flex-1 mx-8 max-w-lg">
            <form onSubmit={(e) => {
              e.preventDefault();
              const term = e.target.search.value;
              if (term.trim()) navigate(`/videos?query=${encodeURIComponent(term)}`);
            }} className="w-full relative group">
              <input
                type="text"
                name="search"
                placeholder="Search videos, users..."
                className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm text-gray-300 focus:outline-none focus:border-purple-500 focus:bg-gray-800 transition-all placeholder-gray-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </form>
          </div>


          <div className="hidden md:block">
            <div className="ml-4 flex items-baseline space-x-6">
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/upload" className={navLinkClass}>
                Upload
              </NavLink>
              <NavLink to="/subscriptions" className={navLinkClass}>
                Subscriptions
              </NavLink>
              {user.username && (
                <NavLink to={`/channel/${user.username}`} className={navLinkClass}>
                  Profile
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>


          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>


      </div>


      {
        isOpen && (
          <div className="md:hidden bg-gray-900 border-b border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink
                to="/"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/upload"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                Upload
              </NavLink>
              <NavLink
                to="/subscriptions"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                Subscriptions
              </NavLink>
              {user.username && (
                <NavLink
                  to={`/channel/${user.username}`}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`
                  }
                >
                  Profile
                </NavLink>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-800 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )
      }
    </nav >
  );
};

export default AppNavbar;
