import Image from "next/image";

function ShopGoal({ sectionName, sectionDescription }) {
  const athletes = [
    {
      name: "Body Building",
      img: "/body.png",
      products: 24,
    },
    {
      name: "Spiritual Health",
      img: "/women1.png",
      products: 24,
    },
    {
      name: "Lean Muscle",
      img: "/women2.png",
      products: 15,
    },
    {
      name: "Weight Loss",
      img: "/women3.png",
      products: 24,
    },
  ];

  return (
    <div className="px-3 sm:px-4 xl:px-8 w-full h-auto flex flex-col py-4 sm:py-6 gap-4 sm:gap-6 lg:pb-16">
      <div className="w-full h-auto font-outfit flex flex-col gap-2 sm:flex-row-reverse sm:justify-between sm:items-center">
        <div className="w-full h-auto flex flex-col gap-1.5 items-end lg:gap-4 sm:w-auto">
          <h1 className="text-[#2A2A2A] font-bold text-2xl sm:text-3xl md:text-4xl xl:text-6xl sm:text-end">
            {sectionName || "Stationary Palace"}
          </h1>
          <div>
            <button className="bg-[#FF6B00] cursor-pointer text-white sm:text-xl font-extrabold rounded-full sm:px-8 px-3 py-1.5 sm:py-2 focus:outline-none transition hover:bg-[#e65c00]">
              View All Goals
            </button>
          </div>
        </div>
        <p className="text-[#2A2A2A] font-bold text-sm sm:text-base md:text-lg xl:text-3xl">
          Unlock your{" "}
          <span className="text-[#FD5B00]">professional potential</span> with{" "}
          <span className="text-[#FD5B00]">premium stationery</span>, designed
          to <span className="text-[#FD5B00]">organize your workflow</span> and
          support your{" "}
          <span className="text-[#FD5B00]">business objectives</span>.
        </p>
      </div>
      <div className="w-full h-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 py-4 sm:py-6 xl:py-14 lg:grid-cols-4 xl:gap-16 gap-3 sm:gap-4 font-outfit">
        <div className="w-full h-[240px] sm:h-[260px] md:h-[280px] flex flex-col p-3 sm:p-4 relative rounded-3xl overflow-hidden bg-[#F9F4ED]">
          <div className="w-full h-auto flex flex-col gap-1.5 relative z-30 xl:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold w-32 sm:w-36">
              {athletes[0].name}
            </h1>
            <span className="text-xs sm:text-sm font-bold">
              Products ({athletes[0].products})
            </span>
            <div>
              <button className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#8B8B8B] md:hover:bg-[#8b8b8bd1] cursor-pointer rounded-full text-white text-xs sm:text-sm font-semibold">
                Buy Now
              </button>
            </div>
          </div>
          <Image
            src={athletes[0].img}
            alt="Body Building"
            width={80}
            height={80}
            className="object-contain w-32 sm:w-36 md:w-44 absolute right-0 bottom-0"
          />
        </div>
        <div className="w-full h-[240px] sm:h-[260px] md:h-[280px] flex flex-col p-3 sm:p-4 relative rounded-3xl overflow-hidden bg-[#F9F4ED]">
          <div className="w-full h-auto flex flex-col justify-end items-end gap-1.5 relative z-30 xl:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold w-28 sm:w-32 text-end">
              {athletes[1].name}
            </h1>
            <span className="text-xs sm:text-sm font-bold">
              Products ({athletes[1].products})
            </span>
            <div>
              <button className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#8B8B8B] md:hover:bg-[#8b8b8bd1] cursor-pointer rounded-full text-white text-xs sm:text-sm font-semibold">
                Buy Now
              </button>
            </div>
          </div>
          <Image
            src={athletes[1].img}
            alt="Spiritual Health"
            width={80}
            height={80}
            className="object-contain w-32 sm:w-36 md:w-44 absolute left-2 sm:left-5 bottom-0"
          />
        </div>
        <div className="w-full h-[240px] sm:h-[260px] md:h-[280px] flex flex-col p-3 sm:p-4 relative rounded-3xl overflow-hidden bg-[#F9F4ED]">
          <div className="w-full h-auto flex flex-col gap-1.5 relative z-30 xl:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold w-32 sm:w-40">
              {athletes[2].name}
            </h1>
            <span className="text-xs sm:text-sm font-bold">
              Products ({athletes[2].products})
            </span>
            <div>
              <button className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#8B8B8B] md:hover:bg-[#8b8b8bd1] cursor-pointer rounded-full text-white text-xs sm:text-sm font-semibold">
                Buy Now
              </button>
            </div>
          </div>
          <Image
            src={athletes[2].img}
            alt="Lean Muscle"
            width={80}
            height={80}
            className="object-contain w-32 sm:w-36 md:w-44 xl:w-48 absolute right-0 bottom-0"
          />
        </div>
        <div className="w-full h-[240px] sm:h-[260px] md:h-[280px] flex flex-col p-3 sm:p-4 relative rounded-3xl overflow-hidden bg-[#F9F4ED]">
          <div className="w-full h-auto flex flex-col gap-1.5 relative z-30 xl:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold w-32 sm:w-40">
              {athletes[3].name}
            </h1>
            <span className="text-xs sm:text-sm font-bold">
              Products ({athletes[3].products})
            </span>
            <div>
              <button className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#8B8B8B] md:hover:bg-[#8b8b8bd1] cursor-pointer rounded-full text-white text-xs sm:text-sm font-semibold">
                Buy Now
              </button>
            </div>
          </div>
          <Image
            src={athletes[3].img}
            alt="Weight Loss"
            width={80}
            height={80}
            className="object-contain w-32 sm:w-36 md:w-44 xl:w-56 absolute right-0 bottom-0"
          />
        </div>
      </div>
    </div>
  );
}

export default ShopGoal;
