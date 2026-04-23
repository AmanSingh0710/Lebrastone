import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";
import instance, { getImageUrl } from "./api/AxiosConfig";
import { getProductPath } from "../../utils/productRoutes";

const defaultConcerns = [
  {
    title: "Acne",
    image: "https://dr.rashel.in/cdn/shop/collections/Dr.Rashel_Acne.jpg?v=1759745165&width=400",
  },
  {
    title: "Black Heads",
    image: "https://dr.rashel.in/cdn/shop/collections/blackheads_nose.png?v=1750921936&width=400",
  },
  {
    title: "Tanning",
    image: "https://dr.rashel.in/cdn/shop/collections/Dr.Rashel_Tann_Skin.jpg?v=1759746391&width=400",
  },
  {
    title: "Dry Skin",
    image: "https://dr.rashel.in/cdn/shop/collections/Dr.Rashel_Dry_Skin.jpg?v=1759746209&width=400",
  },
  {
    title: "Wrinkles",
    image: "https://dr.rashel.in/cdn/shop/collections/Dr.Rashel_Wrinkles.jpg?v=1759745336&width=400",
  },
  {
    title: "Oily Skin",
    image: "https://dr.rashel.in/cdn/shop/collections/Dr.Rashel_Oily_Skin.jpg?v=1759746033&width=400",
  },
];

const SectionHeader = ({ title }) => (
  <div className="flex justify-center mb-10">
    <h2 className="text-lg md:text-2xl font-bold uppercase tracking-[0.2em] text-center">
      {title}
    </h2>
  </div>
);

const ShopByConcern = () => {
  const navigate = useNavigate();
  const [concerns, setConcerns] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerBanner, setOfferBanner] = useState(null);

  useEffect(() => {
    fetchConcerns();
    fetchIngredients();
    fetchOfferBanner();
  }, []);

  const fetchConcerns = async () => {
    try {
      const res = await instance.get("/api/concerns");
      if (res.data.success && res.data.data.length > 0) {
        setConcerns(res.data.data);
      } else {
        setConcerns(defaultConcerns);
      }
    } catch (err) {
      console.error("Error fetching concerns:", err);
      setConcerns(defaultConcerns);
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await instance.get("/api/ingredients");
      if (res.data.success && res.data.data.length > 0) {
        setIngredients(res.data.data);
      } else {
        setIngredients(defaultIngredients);
      }
    } catch (err) {
      console.error("Error fetching ingredients:", err);
      setIngredients(defaultIngredients);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferBanner = async () => {
    try {
      const res = await instance.get("/api/offer-content/type/offerBanner");
      if (res.data.success && res.data.data) {
        setOfferBanner(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching offer banner:", err);
    }
  };

  const getConcernImage = (concern) => {
    if (concern.image) {
      return getImageUrl(concern.image);
    }
    const matched = defaultConcerns.find(
      (c) => c.title.toLowerCase() === concern.title.toLowerCase()
    );
    return matched?.image || defaultConcerns[0]?.image || "";
  };

  const getIngredientImage = (ingredient) => {
    if (ingredient.image) {
      return getImageUrl(ingredient.image);
    }
    const matched = defaultIngredients.find(
      (i) => i.title.toLowerCase() === ingredient.title.toLowerCase()
    );
    return matched?.image || defaultIngredients[0]?.image || "";
  };

  const swiperConfig = {
    modules: [Autoplay],
    autoplay: { delay: 3000, disableOnInteraction: false },
    loop: true,
    spaceBetween: 12,
    slidesPerView: 3.5,
    breakpoints: {
      640: { slidesPerView: 4, spaceBetween: 16 },
      768: { slidesPerView: 4.5, spaceBetween: 20 },
      1024: { slidesPerView: 6, spaceBetween: 20 },
    },
  };

  const ConcernCard = ({ item, image, onClick }) => (
    <div
      onClick={onClick}
      className="flex flex-col items-center group cursor-pointer"
    >
      <div className="w-full aspect-square overflow-hidden rounded-2xl border border-gray-100 shadow-sm transition-transform duration-300 group-hover:scale-105">
        <img
          src={image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="mt-2 text-[10px] md:text-sm font-semibold text-gray-700 uppercase tracking-wide text-center">
        {item.title}
      </p>
    </div>
  );

  return (
    <div className="py-10 md:py-16 bg-white px-4 md:px-8 overflow-hidden">
      
      {/* ================= SHOP BY CONCERN ================= */}
      <div className="max-w-7xl mx-auto mb-10 md:mb-16">
        <SectionHeader title="Shop By Concern" />

        <Swiper {...swiperConfig}>
          {(concerns.length > 0 ? concerns : defaultConcerns).map((item, index) => (
            <SwiperSlide key={item._id || index}>
              <ConcernCard
                item={item}
                image={concerns.length > 0 ? getConcernImage(item) : item.image}
                onClick={() => navigate(`/shop/concern/${item.title}`)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ================= BANNER ================= */}
      {offerBanner && offerBanner.status ? (
        <div
          className="w-full rounded-md md:rounded-md overflow-hidden md:mb-16 cursor-pointer shadow-lg"
          onClick={() =>
            offerBanner.productId
              ? navigate(getProductPath(offerBanner.productId))
              : null
          }
        >
          {offerBanner.image ? (
            <img
              src={getImageUrl(offerBanner.image)}
              alt="Offer Banner"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-[#A88B56]"></div>
          )}
        </div>
      ) : (
        <div className="w-full h-36 md:h-80 rounded-2xl md:rounded-[2rem] overflow-hidden  md:mb-16">
          <img
            src="/banner-ls.jpg"
            alt="Default Banner"
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

    </div>
  );
};

export default ShopByConcern;
