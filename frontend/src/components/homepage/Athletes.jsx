import Image from "next/image";

function Athletes({ sectionName, sectionDescription }) {
  const athletes = [
    {
      name: "Virat Kohli",
      img: "/virat.png",
      products: 24,
      bgColor: "#2A2A2A",
    },
    {
      name: "Mary Kom",
      img: "/marykom.png",
      products: 24,
      bgColor: "#FF7558",
    },
    {
      name: "Lean Muscle",
      img: "/boxer.png",
      products: 15,
      bgColor: "#2A2A2A",
    },
    {
      name: "Sania Nehwal",
      img: "/sania.png",
      products: 24,
      bgColor: "#FFFFFF",
    },
  ];

  return (
    <div className="container-responsive w-full h-auto flex flex-col py-4 sm:py-6 gap-6 sm:gap-8">
      <div className="w-full h-auto font-outfit flex flex-col gap-3 sm:flex-row-reverse sm:justify-between sm:items-center">
        <h1 className="text-[#2A2A2A] font-bold text-2xl sm:text-3xl md:text-4xl xl:text-6xl text-center sm:text-end">
          {sectionName || "Trusted by the<br /> Best"}
        </h1>
        <p className="text-[#2A2A2A] font-bold text-sm sm:text-base md:text-lg xl:text-3xl text-center sm:text-left">
          {sectionDescription ||
            'Join a community of <span className="text-[#FD5B00]">successful businesses</span> who trust our <span className="text-[#FD5B00]">products every day</span>. Our <span className="text-[#FD5B00]">stationery</span> is crafted to support your <span className="text-[#FD5B00]">brand\'s commitment</span> to <span className="text-[#FD5B00]">excellence</span>.'}
        </p>
      </div>
      {/* Mobile: Horizontal Scroll */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide py-4">
        <div className="flex gap-4 pb-4" style={{ width: "max-content" }}>
          {athletes.map((athlete, index) => (
            <div
              key={index}
              className="w-72 h-[320px] flex flex-col p-5 relative rounded-3xl overflow-hidden flex-shrink-0 shadow-lg"
              style={{ backgroundColor: athlete.bgColor }}
            >
              <div className="w-full h-auto flex flex-col gap-3 relative z-30">
                <h1
                  className={`text-2xl sm:text-3xl font-bold leading-tight ${
                    athlete.bgColor === "#FFFFFF" ? "text-black" : "text-white"
                  }`}
                >
                  {athlete.name}
                </h1>
                <span
                  className={`text-sm font-bold ${
                    athlete.bgColor === "#FFFFFF" ? "text-black" : "text-white"
                  }`}
                >
                  Products ({athlete.products})
                </span>
                <div>
                  <button className="px-4 py-2.5 bg-[#F9F4EC] hover:bg-[#f9f4ecd8] cursor-pointer rounded-full text-[#FF7558] text-sm font-semibold transition-all duration-300 hover:scale-105">
                    Buy Now
                  </button>
                </div>
              </div>
              <Image
                src={athlete.img}
                alt={athlete.name}
                width={200}
                height={200}
                className="object-contain w-48 h-auto absolute right-0 bottom-0"
                style={{ width: "auto" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden lg:grid grid-cols-4 py-6 sm:py-8 xl:py-14 gap-3 sm:gap-4 xl:gap-16 font-outfit">
        <div
          className="w-full h-[280px] flex flex-col p-4 relative rounded-3xl overflow-hidden"
          style={{ backgroundColor: athletes[0].bgColor }}
        >
          <div className="w-full h-auto flex flex-col gap-2 relative z-30 xl:gap-4">
            <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold w-28 sm:w-36">
              {athletes[0].name}
            </h1>
            <span className="text-white text-xs sm:text-sm font-bold">
              Products ({athletes[0].products})
            </span>
            <div>
              <button className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#F9F4EC] md:hover:bg-[#f9f4ecd8] cursor-pointer rounded-full text-black text-xs sm:text-sm font-semibold">
                Buy Now
              </button>
            </div>
          </div>
          <Image
            src={athletes[0].img}
            alt="Virat Kohli"
            width={176}
            height={176}
            className="object-contain w-44 h-auto absolute right-0 bottom-0"
            style={{ width: "auto" }}
          />
        </div>
        <div
          className="w-full h-[280px] flex flex-col p-4 relative rounded-3xl overflow-hidden"
          style={{ backgroundColor: athletes[1].bgColor }}
        >
          <div className="w-full h-auto flex flex-col justify-end items-end gap-2 relative z-30 xl:gap-4">
            <h1 className="text-white text-3xl font-bold w-32 text-end">
              {athletes[1].name}
            </h1>
            <span className="text-white text-sm font-bold">
              Products ({athletes[1].products})
            </span>
            <div>
              <button className="px-3 py-2 bg-[#F9F4EC] md:hover:bg-[#f9f4ecd8] cursor-pointer rounded-full text-[#FF7558] text-sm font-semibold">
                Buy Now
              </button>
            </div>
          </div>
          <Image
            src={athletes[1].img}
            alt="Mary Kom"
            width={176}
            height={176}
            className="object-contain w-44 h-auto absolute left-0 bottom-0"
            style={{ width: "auto" }}
          />
        </div>
        <div
          className="w-full h-[280px] flex flex-col p-4 relative rounded-3xl overflow-hidden"
          style={{ backgroundColor: athletes[2].bgColor }}
        >
          <div className="w-full h-auto flex flex-col gap-2 relative z-30 xl:gap-4">
            <h1 className="text-white text-3xl font-bold w-40">
              {athletes[2].name}
            </h1>
            <span className="text-white text-sm font-bold">
              Products ({athletes[2].products})
            </span>
            <div>
              <button className="px-3 py-2 bg-[#F9F4EC] md:hover:bg-[#f9f4ecd8] cursor-pointer rounded-full text-[#FF7558] text-sm font-semibold">
                Buy Now
              </button>
            </div>
          </div>
          <Image
            src={athletes[2].img}
            alt="Lean Muscle"
            width={176}
            height={176}
            className="object-contain w-44 xl:w-48 h-auto absolute right-0 bottom-0"
            style={{ width: "auto" }}
          />
        </div>
        <div
          className="w-full h-[280px] flex flex-col p-4 relative rounded-3xl overflow-hidden shadow-md"
          style={{ backgroundColor: athletes[3].bgColor }}
        >
          <div className="w-full h-auto flex flex-col justify-end items-end gap-2 relative z-30 xl:gap-4">
            <h1 className="text-3xl font-bold w-44 text-end">
              {athletes[3].name}
            </h1>
            <span className="text-sm font-bold">
              Products ({athletes[3].products})
            </span>
            <div>
              <button className="px-3 py-2 bg-[#F9F4EC] md:hover:bg-[#f9f4ecd8] cursor-pointer rounded-full text-[#FF7558] text-sm font-semibold">
                Buy Now
              </button>
            </div>
          </div>
          <Image
            src={athletes[3].img}
            alt="Sania Nehwal"
            width={176}
            height={224}
            className="object-contain w-44 xl:w-56 h-auto absolute left-0 bottom-0"
            style={{ width: "auto" }}
          />
        </div>
      </div>
    </div>
  );
}

export default Athletes;
