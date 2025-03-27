
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center px-6">
        <h1 className="text-6xl md:text-8xl font-display font-bold mb-6">404</h1>
        <p className="text-xl md:text-2xl text-white/70 mb-10">
          The page you are looking for does not exist or is not available to non-members.
        </p>
        <a href="/" className="inline-block bg-white text-black px-8 py-3 rounded-full font-medium transition-all hover:bg-white/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
