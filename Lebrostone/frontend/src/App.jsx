import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LazySection from "./components/common/LazySection";
import SeoMeta from "./components/common/SeoMeta";

// --- WEB (USER) COMPONENTS ---
import Navbar from "./components/web/comman/Navbar";
import Footer from "./components/web/comman/Footer";
const HeroSlider = lazy(() => import("./components/web/HeroSlider"));
const TopPicks = lazy(() => import("./components/web/TopPicks"));
const ShopByCategory = lazy(() => import("./components/web/ShopByCategory"));
const FindDosha = lazy(() => import("./components/web/FindDosha"));
const ShopByConcern = lazy(() => import("./components/web/ShopByConcern"));
const OurStory = lazy(() => import("./components/web/OurStory"));
const AnantamCollection = lazy(() => import("./components/web/AnantamCollection"));
const Reviews = lazy(() => import("./components/web/Reviews"));
const Blogs = lazy(() => import("./components/web/Blogs"));
const BlogDetail = lazy(() => import("./components/web/BlogDetail"));
const ProductDetail = lazy(() => import("./components/web/ProductDetail"));
const ComboDetail = lazy(() => import("./components/web/ComboDetail"));
const AllProductByCategory = lazy(
  () => import("./components/category/AllproductbycategoryID"),
);

// --- NEW USER AUTH & PROFILE COMPONENTS ---
const SignInogin = lazy(() => import("./components/web/auth/SignInogin"));
const SignUplogin = lazy(() => import("./components/web/SignUplogin"));
const UserProfile = lazy(() => import("./components/web/UserProfile"));
const UpdateProfile = lazy(() => import("./components/web/UpdateProfile"));
const Cart = lazy(() => import("./components/web/Cart"));
const Checkout = lazy(() => import("./components/web/Checkout"));
const ForgotPassword = lazy(() => import("./components/web/ForgotPassword"));
const ChangeMobileNumber = lazy(
  () => import("./components/web/ChangeMobileNumber"),
);

// --- ADMIN COMPONENTS ---
import Login from "./components/admin/pages/Login";
import AdminLayout from "./components/admin/layout/AdminLayout";
import Dashboard from "./components/admin/pages/Dashboard";
import Category from "./components/admin/pages/Category";
import ProductbycategoryID from "./components/admin/pages/ProductbycategoryID";
import Sliders from "./components/admin/pages/Sliders";
import Faq from "./components/admin/pages/Faq";
import Productlist from "./components/admin/pages/Productlist";
import Season from "./components/admin/pages/Season";
import ProductDetailView from "./components/admin/pages/ProductDetailView";
import AnantamBanner from "./components/admin/pages/AnantamBanner";
import User from "./components/admin/pages/User";
import Coupon from "./components/admin/pages/Coupon";
import AdminOrders from "./components/admin/pages/AdminOrders";
import Payment from "./components/admin/pages/Payment";
import Brand from "./components/admin/pages/Brand";
import Brandlist from "./components/admin/pages/Brandlist";
import Subcategory from "./components/admin/pages/Subcategory";
import SubSubCategory from "./components/admin/pages/SubSubCategory";
import Addproduct from "./components/admin/pages/Addproduct";
import Productadminlist from "./components/admin/pages/Productadminlist";
import Editprodoct from "./components/admin/pages/Editprodoct";
import Reviewsadmin from "./components/admin/pages/Reviewadmin";
import Real from "./components/admin/pages/Real";
import Blogadmin from "./components/admin/pages/Blogadmin";
import Variant from "./components/admin/pages/Variant";
import Features from "./components/admin/pages/Features";
import ComboView from "./components/admin/pages/ComboView";
import ComboList from "./components/admin/pages/ComboList";
const VideoReelsSection = lazy(() => import("./components/web/VideoReelsSection"));
const TrustedBar = lazy(() => import("./components/web/TrustedBar"));
import Subscribe from "./components/admin/pages/Subscribe";
const PrivacyPolicy = lazy(() => import("./components/web/pages/PrivacyPolicy"));
const ReturnPolicy = lazy(() => import("./components/web/pages/ReturnPolicy"));
const Aboutus = lazy(() => import("./components/web/pages/Aboutus"));
const TermConditions = lazy(() => import("./components/web/pages/TermConditions"));
import OrderConfig from "./components/admin/pages/OrderConfig";
import BusinessPage from "./components/admin/pages/BusinessPage";
import SupportPage from "./components/admin/pages/SupportPage";
import SupportTickets from "./components/admin/pages/SupportTickets";
import AdminTicketDetail from "./components/admin/pages/AdminTicketDetail";
import Paymentpage from "./components/admin/pages/Paymentpage";
import Inbox from "./components/admin/pages/Inbox";
import Story from "./components/admin/pages/Story";
import AdminConcern from "./components/admin/pages/AdminConcern";
import AdminIngredient from "./components/admin/pages/AdminIngredient";
import AdminSettings from "./components/admin/pages/AdminSettings";
import Offerbanner from "./components/admin/pages/Offerbanner";
import FindOffer from "./components/admin/pages/FindOffer";
const CancellationPolicy = lazy(
  () => import("./components/web/pages/CancellationPolicy"),
);
const ShippingPolicy = lazy(() => import("./components/web/pages/ShippingPolicy"));
const RefundPolicy = lazy(() => import("./components/web/pages/RefundPolicy"));
import FloatingSupportWidget from "./components/web/comman/FloatingSupportWidget";
const MyTickets = lazy(() => import("./components/web/MyTickets"));
const TicketDetail = lazy(() => import("./components/web/TicketDetail"));

// ✅ HELPER COMPONENT: URL se ID nikalne ke liye
const ComboViewWrapper = () => {
  const { id } = useParams();
  return <ComboView comboId={id} />;
};

const PageLoader = ({ minHeight = "40vh" }) => (
  <div
    className="flex items-center justify-center w-full bg-white text-gray-500 text-sm"
    style={{ minHeight }}
  >
    Loading...
  </div>
);

const renderLazy = (Component, props = {}, minHeight = "40vh") => (
  <Suspense fallback={<PageLoader minHeight={minHeight} />}>
    <Component {...props} />
  </Suspense>
);

function App() {
  const isAdminAuthenticated = localStorage.getItem("adminToken");
  const isUserAuthenticated = localStorage.getItem("user");

  return (
    <Routes>
      {/* 1. HOME ROUTE */}
      <Route
        path="/"
        element={
          <>
            <SeoMeta
              title="LEBROSTONE - Natural Skincare & Wellness"
              description="Explore LEBROSTONE's premium skincare, herbal, and wellness products crafted for healthy everyday living."
              image="/banner-ls.jpg"
            />
            <Navbar />
            {renderLazy(HeroSlider, {}, "220px")}

            <LazySection minHeight={360}>
              <TopPicks />
            </LazySection>
            <LazySection minHeight={280}>
              <ShopByCategory />
            </LazySection>
            <LazySection minHeight={320}>
              <FindDosha />
            </LazySection>
            <LazySection minHeight={320}>
              <ShopByConcern />
            </LazySection>
            <LazySection minHeight={240}>
              <OurStory />
            </LazySection>
            <LazySection minHeight={340}>
              <AnantamCollection />
            </LazySection>

            <LazySection minHeight={260}>
              <VideoReelsSection />
            </LazySection>
            <LazySection minHeight={300}>
              <Blogs limit={6} />
            </LazySection>

            <LazySection minHeight={80}>
              <TrustedBar />
            </LazySection>
            <LazySection minHeight={220}>
              <Reviews />
            </LazySection>
            <Footer />
            <FloatingSupportWidget />
          </>
        }
      />

      {/* 2. AUTH ROUTES */}
      <Route
        path="/login"
        element={
          isUserAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <>
              <SeoMeta
                title="Login | LEBROSTONE"
                description="Login to your LEBROSTONE account to manage orders, cart, and profile."
                noIndex
              />
              {renderLazy(SignInogin)}
            </>
          )
        }
      />
      <Route
        path="/signup"
        element={
          isUserAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <>
              <SeoMeta
                title="Sign Up | LEBROSTONE"
                description="Create your LEBROSTONE account for faster checkout and order tracking."
                noIndex
              />
              {renderLazy(SignUplogin)}
            </>
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isUserAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <>
              <SeoMeta
                title="Forgot Password | LEBROSTONE"
                description="Reset your LEBROSTONE account password securely."
                noIndex
              />
              {renderLazy(ForgotPassword)}
            </>
          )
        }
      />
      <Route
        path="/change-mobile"
        element={
          isUserAuthenticated ? (
            <>
              <SeoMeta
                title="Change Mobile Number | LEBROSTONE"
                description="Update your registered mobile number for your LEBROSTONE account."
                noIndex
              />
              {renderLazy(ChangeMobileNumber)}
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* 3. USER PROTECTED ROUTES */}
      <Route
        path="/profile"
        element={
          isUserAuthenticated ? (
            <>
              <SeoMeta
                title="My Profile | LEBROSTONE"
                description="Manage your profile details and account settings."
                noIndex
              />
              <Navbar />
              {renderLazy(UserProfile)}
              <Footer />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/update-profile"
        element={
          isUserAuthenticated ? (
            <>
              <SeoMeta
                title="Update Profile | LEBROSTONE"
                description="Edit your profile information in your LEBROSTONE account."
                noIndex
              />
              <Navbar />
              {renderLazy(UpdateProfile)}
              <Footer />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/cart"
        element={
          isUserAuthenticated ? (
            <>
              <SeoMeta
                title="My Cart | LEBROSTONE"
                description="Review and manage products added to your cart."
                noIndex
              />
              <Navbar />
              {renderLazy(Cart)}
              <Footer />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/checkout"
        element={
          <>
            <SeoMeta
              title="Checkout | LEBROSTONE"
              description="Secure checkout for your LEBROSTONE order."
              noIndex
            />
            <Navbar />
            {renderLazy(Checkout)}
            <Footer />
          </>
        }
      />

      {/* 4. PRODUCT & SHOP ROUTES */}
      <Route
        path="/product/:slug/:id"
        element={
          <>
            <SeoMeta
              title="Product Details | LEBROSTONE"
              description="View complete product details, variants, ingredients, and usage information."
            />
            <Navbar />
            {renderLazy(ProductDetail)}
            <Footer />
          </>
        }
      />
      <Route
        path="/product/:id"
        element={
          <>
            <SeoMeta
              title="Product Details | LEBROSTONE"
              description="View complete product details, variants, ingredients, and usage information."
            />
            <Navbar />
            {renderLazy(ProductDetail)}
            <Footer />
          </>
        }
      />
      <Route
        path="/combo/:id"
        element={
          <>
            <SeoMeta
              title="Combo Offer | LEBROSTONE"
              description="Discover special combo offers with curated products and savings."
            />
            <Navbar />
            {renderLazy(ComboDetail)}
            <Footer />
          </>
        }
      />
      <Route
        path="/shop"
        element={
          <>
            <SeoMeta
              title="Shop All Products | LEBROSTONE"
              description="Browse all LEBROSTONE products across skincare, wellness, and herbal care."
            />
            <Navbar />
            {renderLazy(AllProductByCategory)}
            <Footer />
          </>
        }
      />
      <Route
        path="/shop/category/:categoryId"
        element={
          <>
            <SeoMeta
              title="Shop by Category | LEBROSTONE"
              description="Explore LEBROSTONE products by category."
            />
            <Navbar />
            {renderLazy(AllProductByCategory)}
            <Footer />
          </>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <>
            <SeoMeta
              title="Privacy Policy | LEBROSTONE"
              description="Read the privacy policy for LEBROSTONE website and services."
            />
            <Navbar />
            {renderLazy(PrivacyPolicy)}
            <Footer />
          </>
        }
      />
      <Route
        path="/return-policy"
        element={
          <>
            <SeoMeta
              title="Return Policy | LEBROSTONE"
              description="Review LEBROSTONE return terms and eligibility details."
            />
            <Navbar />
            {renderLazy(ReturnPolicy)}
            <Footer />
          </>
        }
      />
      <Route
        path="/shipping-policy"
        element={
          <>
            <SeoMeta
              title="Shipping Policy | LEBROSTONE"
              description="Learn about LEBROSTONE shipping timelines, charges, and delivery terms."
            />
            <Navbar />
            {renderLazy(ShippingPolicy)}
            <Footer />
          </>
        }
      />
      <Route
        path="/cancellation-policy"
        element={
          <>
            <SeoMeta
              title="Cancellation Policy | LEBROSTONE"
              description="Read cancellation rules and conditions for LEBROSTONE orders."
            />
            <Navbar />
            {renderLazy(CancellationPolicy)}
            <Footer />
          </>
        }
      />
      <Route
        path="/support/my-tickets"
        element={
          isUserAuthenticated ? (
            <>
              <SeoMeta
                title="My Support Tickets | LEBROSTONE"
                description="Track and manage your support tickets."
                noIndex
              />
              <Navbar />
              {renderLazy(MyTickets)}
              <Footer />
              <FloatingSupportWidget />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/support/ticket/:ticketId"
        element={
          isUserAuthenticated ? (
            <>
              <SeoMeta
                title="Support Ticket | LEBROSTONE"
                description="View detailed status and responses for your support ticket."
                noIndex
              />
              <Navbar />
              {renderLazy(TicketDetail)}
              <Footer />
              <FloatingSupportWidget />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/about-us"
        element={
          <>
            <SeoMeta
              title="About Us | LEBROSTONE"
              description="Know more about LEBROSTONE, our vision, and our wellness-first product philosophy."
            />
            <Navbar />
            {renderLazy(Aboutus)}
            <Footer />
          </>
        }
      />
      <Route
        path="/term-conditions"
        element={
          <>
            <SeoMeta
              title="Terms & Conditions | LEBROSTONE"
              description="Read the terms and conditions for using LEBROSTONE website and services."
            />
            <Navbar />
            {renderLazy(TermConditions)}
            <Footer />
          </>
        }
      />
      <Route
        path="/shop/concern/:concernName"
        element={
          <>
            <SeoMeta
              title="Shop by Concern | LEBROSTONE"
              description="Find LEBROSTONE products curated for your skin and wellness concerns."
            />
            <Navbar />
            {renderLazy(AllProductByCategory)}
            <Footer />
          </>
        }
      />
      <Route
        path="/shop/ingredient/:ingredientName"
        element={
          <>
            <SeoMeta
              title="Shop by Ingredient | LEBROSTONE"
              description="Discover LEBROSTONE products based on key ingredients."
            />
            <Navbar />
            {renderLazy(AllProductByCategory)}
            <Footer />
          </>
        }
      />
      <Route
        path="/collections/:categoryId"
        element={
          <>
            <SeoMeta
              title="Collections | LEBROSTONE"
              description="Explore curated LEBROSTONE collections for better skincare and wellness."
            />
            <Navbar />
            {renderLazy(AllProductByCategory)}
            <Footer />
          </>
        }
      />
      <Route
        path="/blogs"
        element={
          <>
            <SeoMeta
              title="Blogs | LEBROSTONE"
              description="Read expert tips, product guides, and wellness insights from LEBROSTONE."
            />
            <Navbar />
            {renderLazy(Blogs)}
            <Footer />
          </>
        }
      />
      <Route
        path="/blog/:id"
        element={
          <>
            <SeoMeta
              title="Blog Details | LEBROSTONE"
              description="Read detailed blog articles from LEBROSTONE."
            />
            <Navbar />
            {renderLazy(BlogDetail)}
          </>
        }
      />
      <Route
        path="/refund-policy"
        element={
          <>
            <SeoMeta
              title="Refund Policy | LEBROSTONE"
              description="View refund process and conditions for LEBROSTONE orders."
            />
            <Navbar />
            {renderLazy(RefundPolicy)}
            <Footer />
          </>
        }
      />

      {/* 5. ADMIN LOGIN */}
      <Route
        path="/admin/login"
        element={
          isAdminAuthenticated ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <>
              <SeoMeta
                title="Admin Login | LEBROSTONE"
                description="Admin authentication portal."
                noIndex
              />
              <Login />
            </>
          )
        }
      />

      {/* 6. ADMIN PROTECTED ROUTES */}
      <Route
        path="/admin/*"
        element={
          <>
            <SeoMeta
              title="Admin Panel | LEBROSTONE"
              description="Internal admin portal."
              noIndex
            />
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="sliders" element={<Sliders />} />
                <Route path="category" element={<Category />} />
                <Route path="faq" element={<Faq />} />
                <Route path="productsshow" element={<Productlist />} />
                <Route path="season" element={<Season />} />{" "}
                <Route path="orderconfig" element={<OrderConfig />} />
                <Route path="businesspage" element={<BusinessPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="support-tickets" element={<SupportTickets />} />
                <Route
                  path="support/ticket/:ticketId"
                  element={<AdminTicketDetail />}
                />
                <Route path="paymentpage" element={<Paymentpage />} />
                <Route path="inbox" element={<Inbox />} />
                <Route path="heroslider" element={<Sliders />} />
                <Route path="story" element={<Story />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="concern" element={<AdminConcern />} />
                {/* <Route path="ingredient" element={<AdminIngredient />} /> */}
                <Route path="offerbanner" element={<Offerbanner />} />
                <Route path="findoffer" element={<FindOffer />} />
                {/* Season is your Add Combo Page */}
                <Route
                  path="product/view/:productId"
                  element={<ProductDetailView />}
                />
                <Route path="anantambanner" element={<AnantamBanner />} />
                <Route
                  path="products/add/:categoryId"
                  element={<ProductbycategoryID />}
                />
                <Route path="users" element={<User />} />
                <Route path="coupons" element={<Coupon />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="payments" element={<Payment />} />
                <Route path="brand" element={<Brand />} />
                <Route path="brandslist" element={<Brandlist />} />
                <Route path="subcategory" element={<Subcategory />} />
                <Route path="subsubcategory" element={<SubSubCategory />} />
                <Route path="productadminlist" element={<Productadminlist />} />
                <Route path="addproduct" element={<Addproduct />} />
                <Route path="reviews" element={<Reviewsadmin />} />
                <Route path="real" element={<Real />} />
                <Route path="blog" element={<Blogadmin />} />
                <Route path="variant" element={<Variant />} />
                <Route path="features" element={<Features />} />
                <Route path="subscribe" element={<Subscribe />} />
                {/* ✅ COMBO ROUTES (CLEANED) */}
                <Route path="/addcombo" element={<Season />} />
                <Route path="combos/add" element={<Season />} />
                <Route path="combos/edit/:id" element={<Season />} />
                <Route path="comboslist" element={<ComboList />} />
                <Route path="combo/view/:id" element={<ComboViewWrapper />} />
                <Route path="product/edit/:id" element={<Editprodoct />} />
                <Route
                  path="*"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          </>
        }
      />

      {/* 7. GLOBAL 404 REDIRECT */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
