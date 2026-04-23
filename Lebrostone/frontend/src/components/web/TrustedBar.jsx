import React from "react";

const TrustedBar = () => {
  const items = [
    { image: "/p1.png" },
    { image: "/p2.png" },
    { image: "/p3.png" },
    { image: "/p4.png" },
    { image: "/p5.png" },
    { image: "/p6.png" },
  ];

  return (
    <section className="py-3 md:py-6 bg-white overflow-hidden">
      <div className="flex justify-center mb-2 md:mb-10">
        <div className="text-black py-3 px-12 md:px-24">
          <h2 className="text-lg md:text-2xl font-bold uppercase tracking-[0.2em] text-center">
            Our Trusted Partners
          </h2>
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 px-4 opacity-70 grayscale hover:grayscale-0 transition-all">
        {items.map((item, index) => (
          <div
            className="w-12 h-12 md:w-24 md:h-24 flex items-center justify-center "
            key={index}
          >
            <img
              className="h-full w-full object-contain"
              src={item.image}
              alt=""
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustedBar;
