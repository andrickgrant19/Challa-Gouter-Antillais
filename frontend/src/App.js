import "./App.css";
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
import About from "./pages/About";
import Catering from "./pages/Catering";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardMenu from "./pages/DashboardMenu";
import DashboardMessages from "./pages/DashboardMessages";
import DashboardHistory from "./pages/DashboardHistory";

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
          <ChromeWrapper>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/about" element={<About />} />
              <Route path="/catering" element={<Catering />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                <Route index element={<DashboardOrders />} />
                <Route path="menu" element={<DashboardMenu />} />
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
