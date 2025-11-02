import Image from "next/image";

function WeeklyDeal({ sectionName }) {
  return (
    <div className="w-full h-auto flex flex-col md:flex-row py-4 sm:py-6 bg-[#F9F4ED] mb-4 sm:mb-8 lg:py-16">
      <div className="w-full h-auto flex justify-center items-center relative overflow-hidden lg:overflow-visible">
        <Image
          src="/weekly1.png"
          alt="Weekly Deal"
          width={150}
          height={150}
          className="object-contain w-48 sm:w-56 md:w-80 lg:w-[550px] lg:absolute lg:z-0 lg:-bottom-32"
        />
        <Image
          src="/weekly2.png"
          alt="Weekly Deal"
          width={150}
          height={150}
          className="object-contain w-40 sm:w-48 md:w-[280px] absolute z-10 -bottom-4 sm:-bottom-6 md:-bottom-8 left-1/2 transform -translate-x-1/3 lg:-bottom-[170px] lg:w-[450px]"
        />
      </div>
      <div className="w-full h-auto flex flex-col font-outfit gap-2 sm:gap-3 md:gap-4 container-responsive lg:gap-10">
        <div className="w-full h-auto flex flex-col gap-3 sm:gap-4 lg:flex-row lg:gap-10 xl:gap-20">
          <div className="w-auto h-auto flex justify-center md:justify-start items-center">
            <div className="flex rounded-2xl sm:rounded-3xl w-auto gap-2 sm:gap-3 md:gap-6 shadow text-center border border-[#8B8B8B] bg-white px-2 py-1.5 sm:px-3 sm:py-2 md:px-5 md:py-3">
              {[
                { value: "3", label: "Days" },
                { value: "17", label: "Hours" },
                { value: "3", label: "Minutes" },
                { value: "9", label: "Second" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-center items-center"
                >
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#FF7558]">
                    {item.value}
                  </p>
                  <p className="text-xs sm:text-sm text-[#8B8B8B] font-medium">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full h-auto">
            <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              {sectionName || "Weekly Deal"}
            </h1>
            <span className="font-bold text-xs sm:text-sm">
              Don’t Miss Out!
            </span>
          </div>
        </div>
        <div className="w-full h-auto lg:w-auto">
          <p className="text-[#8B8B8B] font-bold text-base sm:text-lg lg:text-right lg:text-2xl xl:text-3xl">
            When buying Whey protein, <br />
            BCAA 5000 Powder is added as a bonus
          </p>
        </div>
        <div className="w-full h-auto mt-4 sm:mt-6 flex lg:justify-end lg:mt-10">
          <button className="bg-[#FD5B00] font-semibold text-white text-sm sm:text-base md:text-lg lg:text-xl px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl sm:rounded-3xl cursor-pointer md:hover:bg-[#fd5d00ce] w-full sm:w-auto">
            Claim Deal Now
          </button>
        </div>
      </div>
    </div>
  );
}
export default WeeklyDeal;
