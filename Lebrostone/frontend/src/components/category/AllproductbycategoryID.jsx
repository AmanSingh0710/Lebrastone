import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance, { getImageUrl } from "../web/api/AxiosConfig";
import { Loader2, ShoppingCart, Star } from "lucide-react";
import Navbar from "../web/comman/Navbar";
import Footer from "../web/comman/Footer";
import { getProductPath } from "../../utils/productRoutes";
import SeoMeta from "../common/SeoMeta";

const AllProductByCategory = () => {
  const { categoryId, concernName, ingredientName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allProductsRaw, setAllProductsRaw] = useState([]);
  const [headerTitle, setHeaderTitle] = useState("Our Collection");
  const [loading, setLoading] = useState(true);
  const [imageFallbackIndex, setImageFallbackIndex] = useState({});

  const getCleanImageUrl = (imagePath) => {
    if (!imagePath) return "/favicon.png";
    const url = getImageUrl(imagePath);
    return url || "/favicon.png";
  };

  const getProductImageCandidates = (product) => {
    const candidates = [
      product.thumbnail,
      product.images?.[0],
      product.variants?.[0]?.thumbnail,
      product.variants?.[0]?.images?.[0],
    ]
      .filter(Boolean)
      .map((img) => getCleanImageUrl(img));

    const uniqueCandidates = [...new Set(candidates)];
    return uniqueCandidates.length > 0 ? uniqueCandidates : ["/favicon.png"];
  };

  const getProductDisplayImage = (product) => {
    const candidates = getProductImageCandidates(product);
    const currentIdx = imageFallbackIndex[product._id] || 0;
    return candidates[currentIdx] || "/favicon.png";
  };

  const handleImageError = (product) => {
    const candidates = getProductImageCandidates(product);
    setImageFallbackIndex((prev) => {
      const currentIdx = prev[product._id] || 0;
      if (currentIdx >= candidates.length - 1) return prev;
      return { ...prev, [product._id]: currentIdx + 1 };
    });
  };

  const getProductPrice = (product) => {
    let sp = Number(product.selling_price) || Number(product.unitPrice) || 0;
    let mrp = Number(product.mrp) || Number(product.unitPrice) || 0;
    if (sp === 0 && product.variants?.length > 0) {
      sp = Number(product.variants[0].selling_price) || 0;
      mrp = Number(product.variants[0].mrp) || 0;
    }
    return { sp, mrp };
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let endpoint = "/api/products";
        let title = "Shop All";

        if (categoryId) {
          endpoint = `/api/products/by-category/${categoryId}`;
          title = "Category Collection";
        } else if (concernName) {
          endpoint = `/api/products/by-concern/${concernName}`;
          title = `Concern: ${concernName}`;
        } else if (ingredientName) {
          endpoint = `/api/products/by-ingredient/${ingredientName}`;
          title = `Ingredient: ${ingredientName}`;
        }

        const res = await instance.get(endpoint);
        const data = res.data.data || res.data.products || [];
        setProducts(data);

        if (data.length > 0) {
          if (categoryId && data[0].category?.name) {
            setHeaderTitle(data[0].category.name);
          } else {
            setHeaderTitle(title);
          }
        } else {
          setHeaderTitle(title);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo(0, 0);
  }, [categoryId, concernName, ingredientName]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#00AFEF]" size={50} />
      </div>
    );

  return (
    <div className="bg-white min-h-screen">
      <SeoMeta
        title={`${headerTitle} | LEBROSTONE`}
        description={`Browse ${headerTitle} products at LEBROSTONE.`}
      />
      {/* Header Section */}
      <div className="bg-slate-50 py-12 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 mb-2">
            {headerTitle}
          </h1>
          <p className="text-gray-500 text-sm">Home / Shop / {headerTitle}</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-16">
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No products found for this selection.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const { sp: sellingPrice, mrp } = getProductPrice(product);
              const displayImage = getProductDisplayImage(product);
              
              const discount =
                mrp > sellingPrice
                  ? Math.round(((mrp - sellingPrice) / mrp) * 100)
                  : 0;

              return (
                <div
                  key={product._id}
                  className="group cursor-pointer"
                  onClick={() => navigate(getProductPath(product))}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-2xl mb-4">
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                        -{discount}%
                      </div>
                    )}
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => handleImageError(product)}
                    />
                    <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <ShoppingCart size={18} />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 uppercase line-clamp-1 mb-1 px-1">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-2 px-1">
                    {mrp > sellingPrice && (
                      <span className="text-gray-400 line-through text-xs">
                        ₹{mrp}
                      </span>
                    )}
                    <span className="font-bold text-gray-900">
                      ₹{sellingPrice}
                    </span>
                  </div>

                  <div className="flex text-yellow-400 mb-4 px-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < 4 ? "currentColor" : "none"}
                      />
                    ))}
                  </div>

                  <button className="w-full border border-black py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors rounded-lg">
                    View Product
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProductByCategory;
