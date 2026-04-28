import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import FloatingCart from "./components/FloatingCart";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Catering from "./pages/Catering";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardMenu from "./pages/DashboardMenu";
import DashboardCombo from "./pages/DashboardCombo";
import DashboardFamily from "./pages/DashboardFamily";
import DashboardDrinks from "./pages/DashboardDrinks";
import DashboardCatering from "./pages/DashboardCatering";
import DashboardMessages from "./pages/DashboardMessages";
import DashboardHistory from "./pages/DashboardHistory";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Reset scroll to top on every route change so landing on /menu (or any
    // page) always starts at the top — e.g. clicking a dish card on the
    // homepage arrives at Step 1 of the combo builder, not mid-page.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function ChromeWrapper({ children }) {
  const { pathname } = useLocation();
  // Hide public Navbar/Footer on owner-only routes
  const isOwner = pathname.startsWith("/dashboard") || pathname === "/login";
  return (
    <div className="App min-h-screen flex flex-col bg-brand-cream">
      {!isOwner && <Navbar />}
      <div className="flex-1">{children}</div>
      {!isOwner && <Footer />}
      {!isOwner && <CartDrawer />}
      {!isOwner && <FloatingCart />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ChromeWrapper>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/catering" element={<Catering />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                <Route index element={<DashboardOrders />} />
                <Route path="combo" element={<DashboardCombo />} />
                <Route path="family" element={<DashboardFamily />} />
                <Route path="drinks" element={<DashboardDrinks />} />
                <Route path="menu" element={<DashboardMenu />} />
                <Route path="catering" element={<DashboardCatering />} />
                <Route path="messages" element={<DashboardMessages />} />
                <Route path="history" element={<DashboardHistory />} />
              </Route>
            </Routes>
          </ChromeWrapper>
        </BrowserRouter>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
