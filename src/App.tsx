
import { useState, useEffect, useContext } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import MemberPanel from "./pages/MemberPanel";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";
import PrivateRoute from "./components/PrivateRoute";
import { observer } from "mobx-react-lite";
import { Context } from "./main";
import { check } from "./http/userAPI";

const queryClient = new QueryClient();

const App = observer(() => {
  const [loading, setLoading] = useState(true);

  const { userStore } = useContext(Context);

  const finishLoading = () => {
    setLoading(false);
  };

  useEffect(() => {
    check().then(data => {
      userStore.setIsAuth(true);
      userStore.setUser(data); // сохраняем данные пользователя в сторе
      console.log(data);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {loading && <LoadingScreen finishLoading={finishLoading} />}

          <div style={{ opacity: loading ? 0 : 1, transition: "opacity 0.5s ease-in-out" }}>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/admin"
                  element={
                    userStore.isAuth &&
                      userStore.user &&
                      (userStore.user.role === 'admin' || userStore.user.role === 'moderator') ? (
                      <Admin />
                    ) : (
                      <NotFound />
                    )
                  }
                />
                <Route
                  path="/member-panel"
                  element={userStore.isAuth ? <MemberPanel /> : <NotFound />}
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
});

export default App;
