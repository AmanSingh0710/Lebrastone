import React, { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaLinkedinIn,
  FaYoutube,
  FaAmazon,
} from "react-icons/fa";
import { FaDiagramPredecessor, FaXTwitter } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import instance from "../api/AxiosConfig";

const Footer = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [mess, setMess] = useState("");
  const [st, setSt] = useState(false);
  const subscribeHandler = () => {
    instance
      .post("/api/subscription/add", { email })
      .then((res) => {
        setSt(true);
        setMess(res.data.message);
        setEmail("");

        setTimeout(() => {
          setMess("");
        }, 3000);
      })
      .catch((err) => {
        setSt(false);
        setMess("Failed to subscribe. Please try again later.");
      });
  };

  return (
    <footer className="bg-[#FAF6EA] pt-10 md:pt-16 pb-6 md:pb-8 font-sans border-t">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-8 md:mb-16">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
          Join the Lebrostone Newsletter
        </h2>
        <p className="text-sm text-gray-600 mb-6 md:mb-8">
          Get skincare tips, offers & new launch updates!
        </p>

        <div className="max-w-xl mx-auto flex items-center bg-white rounded-full shadow-sm p-1 pr-1 pl-4 md:pl-6 border border-gray-100">
          <HiOutlineMail className="text-gray-400 text-lg md:text-xl mr-2 md:mr-3" />
          <input
            type="email"
            placeholder="youremail123@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-gray-700 text-xs md:text-sm py-2 md:py-3"
          />
          {/* Error message */}
          <button
            onClick={() => subscribeHandler()}
            className="bg-[#C5A987] text-white px-5 md:px-8 py-2 md:py-3 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider hover:bg-[#b09675] transition-colors"
          >
            Subscribe
          </button>
        </div>
        {st && <p className="text-green-500 text-xs md:text-sm">{mess}</p>}
        {!st && <p className="text-red-500 text-xs md:text-sm">{mess}</p>}
      </div>

      {/* Links Section */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4 md:gap-10 mb-8 md:mb-16">
        {/* Shop */}
        <div>
          <h3 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-widest">
            Shop
          </h3>
          <ul className="space-y-3 text-[13px] text-gray-600">
            <li>
              <button
                onClick={() => navigate("/shop/category/skin-care")}
                className="hover:text-[#C5A987] text-left"
              >
                Skin
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shop/category/daily-wellness")}
                className="hover:text-[#C5A987] text-left"
              >
                Bath & Body
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shop/category/hair-care")}
                className="hover:text-[#C5A987] text-left"
              >
                Hair
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shop/category/mens-health")}
                className="hover:text-[#C5A987] text-left"
              >
                Men
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/collections/anantam")}
                className="hover:text-[#C5A987] text-left"
              >
                Anantam
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shop")}
                className="hover:text-[#C5A987] text-left"
              >
                All Products
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/")}
                className="hover:text-[#C5A987] text-left"
              >
                Combos
              </button>
            </li>
          </ul>
        </div>

        {/*  Policies & Information */}
        <div>
          <h3 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-widest">
            Policies & Information
          </h3>
          <ul className="space-y-3 text-[13px] text-gray-600">
            <li>
              <button
                onClick={() => navigate("/term-conditions")}
                className="hover:text-[#C5A987] text-left"
              >
                Terms & Conditions
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/return-policy")}
                className="hover:text-[#C5A987] text-left"
              >
                Return Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/privacy-policy")}
                className="hover:text-[#C5A987] text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/refund-policy")}
                className="hover:text-[#C5A987] text-left"
              >
                Refund Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/cancellation-policy")}
                className="hover:text-[#C5A987] text-left"
              >
                Cancellation Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shipping-policy")}
                className="hover:text-[#C5A987] text-left"
              >
                Shipping Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/about-us")}
                className="hover:text-[#C5A987] text-left"
              >
                About Us
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-widest">
            Customer Care
          </h3>
          <ul className="space-y-3 text-[13px] text-gray-600">
            <li>
              <button
                onClick={() => navigate("/profile")}
                className="hover:text-[#C5A987] text-left"
              >
                My Account
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/cart")}
                className="hover:text-[#C5A987] text-left"
              >
                My Cart
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/profile")}
                className="hover:text-[#C5A987] text-left"
              >
                My Orders
              </button>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-widest">
            Quick Links
          </h3>
          <ul className="space-y-3 text-[13px] text-gray-600">
            <li>
              <button
                onClick={() => navigate("/")}
                className="hover:text-[#C5A987] text-left"
              >
                Our Story
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shop/category/mens-health")}
                className="hover:text-[#C5A987] text-left"
              >
                Men's Health
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shop/category/womens-health")}
                className="hover:text-[#C5A987] text-left"
              >
                Women's Health
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/shop/category/weight-management")}
                className="hover:text-[#C5A987] text-left"
              >
                Weight Management
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/blogs")}
                className="hover:text-[#C5A987] text-left"
              >
                Blogs
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/login")}
                className="hover:text-[#C5A987] text-left"
              >
                Login / Register
              </button>
            </li>
          </ul>
        </div>

        {/* Address */}
        <div>
          <h3 className="font-bold text-gray-800 mb-6 uppercase text-sm tracking-widest">
            Address
          </h3>
          <div className="text-[13px] text-gray-600 space-y-4 leading-relaxed">
            <p>
              343, Alok Nagar
              <br />
              Kanadiya Road, Indore
              <br />
              452016, MP, India
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:info@lebrostone.in"
                className="hover:text-[#C5A987]"
              >
                info@lebrostone.in
              </a>
            </p>
            <p>Mobile : +91 7067503515</p>
            <div className="flex gap-4 pt-4">
              {/* {
              Add this detail in the footer section 

              Address:- 343, Alok Nagar, Kanadiya Road, Indore 452016, MP
              Contact No:- 
              Facebook:- https://www.facebook.com/profile.php?id=61587803026892
              Instagram:- https://www.instagram.com/lebrostone_/
              Youtube:-https://www.youtube.com/@Lebrostone
              Pinterest:-https://in.pinterest.com/lebrostone/
              Linkedin:-https://www.linkedin.com/company/lebrostone
              Twitter :- https://x.com/lebrostone
              
              } */}
              <a
                href="https://www.facebook.com/profile.php?id=61587803026892"
                className="text-gray-800 hover:text-[#C5A987] transition-colors"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://www.youtube.com/@Lebrostone"
                className="text-gray-800 hover:text-[#C5A987] transition-colors"
              >
                <FaYoutube />
              </a>
              <a
                href="https://x.com/lebrostone"
                className="text-gray-800 hover:text-[#C5A987] transition-colors"
              >
                <FaXTwitter />
              </a>
              <a
                href="https://www.instagram.com/lebrostone_/"
                className="text-gray-800 hover:text-[#C5A987] transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="https://in.pinterest.com/lebrostone/"
                className="text-gray-800 hover:text-[#C5A987] transition-colors"
              >
                <FaPinterestP />
              </a>
              <a
                href="https://www.linkedin.com/company/lebrostone"
                className="text-gray-800 hover:text-[#C5A987] transition-colors"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* {also availabile on } */}

      <div className="max-w-7xl pb-10 mx-auto px-4 flex flex-col items-center">
        <p className="text-mf font-medium text-gray-700 uppercase tracking-widest">
          Also available on
        </p>
        <div className="flex gap-4 pt-4">
          <div className="w-[40px] h-[40px]  rounded-sm overflow-hidden hover:scale-105 transition-transform duration-300 ">
            <img
              className="h-full w-full object-contain hover:scale-110 transition-transform duration-300 "
              src="/amazon.png"
              alt="amazon"
            />
          </div>
          <div className="w-[40px] h-[40px ] rounded-sm overflow-hidden hover:scale-105 transition-transform duration-300 ">
            <img
              className="h-full w-full object-contain hover:scale-110 transition-transform duration-300 "
              src="/flipkart.webp"
              alt="flipkart"
            />
          </div>
          <div className="w-[40px] h-[40px]  rounded-sm overflow-hidden hover:scale-105 transition-transform duration-300 ">
            <img
              className="h-full w-full object-contain hover:scale-110 transition-transform duration-300 "
              src="/Blinkit-yellow-app-icon.svg"
              alt="blinkit"
            />
          </div>
          <div className="w-[40px] h-[40px]  rounded-sm overflow-hidden hover:scale-105 transition-transform duration-300 ">
            <img
              className="h-full w-full object-contain hover:scale-110 transition-transform duration-300 "
              src="/Meesho_logo.png"
              alt="meeso"
            />
          </div>
          <div className="w-[40px] h-[40px]  rounded-sm overflow-hidden hover:scale-105 transition-transform duration-300 ">
            <img
              className="h-full w-full object-contain hover:scale-110 transition-transform duration-300 "
              src="/jiomart.jpeg"
              alt="jiomart"
            />
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-4 border-t border-gray-200/50 pt-6 md:pt-8 flex flex-col items-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
          ©️ 2026 Lebroid Healthcare Private Limited. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
