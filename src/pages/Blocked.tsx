import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import { Context } from "../main";

const Blocked = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userStore } = useContext(Context);

  useEffect(() => {
    console.error(
      "Blocked: User attempted to access a blocked route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleLogout = () => {
    userStore.logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center px-6">
        <h1 className="text-6xl md:text-8xl font-display font-bold mb-6">
          Blocked
        </h1>
        <p className="text-xl md:text-2xl text-white/70 mb-10">
          The page you are trying to access has been blocked. Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={handleLogout}
          className="inline-block bg-white text-black px-8 py-3 rounded-full font-medium transition-all hover:bg-white/90"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Blocked;
