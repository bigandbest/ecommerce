import Image from "next/image";

const sportsData = [
  { title: "Football Suplement", image: "/football.png" },
  { title: "Recovery Suplement", image: "/football.png" },
  { title: "Football Suplement", image: "/football.png" },
  { title: "Shape Suplement", image: "/football.png" },
];

function RefreshWorkspace({ sectionName, sectionDescription }) {
  return (
    <div className="px-5 xl:px-8 bg-[#ffffff] w-full pb-20 font-outfit">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-8">
        <div className="flex flex-col items-start gap-4 flex-1">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#222]">
            {sectionName || "Refresh WorkSpace"}
          </h2>
          <button className="bg-[#FF6B00] text-white text-base font-bold rounded-full px-6 py-2 mt-2 shadow-sm hover:bg-[#e65c00] transition">
            Explore Store
          </button>
        </div>
        <div className="flex-1 text-center lg:text-right">
          <p className="text-2xl lg:text-3xl font-bold text-[#2A2A2A] leading-snug">
            Transform your{" "}
            <span className="text-[#FD5B00]">sedentary workday</span> into an{" "}
            <span className="text-[#FD5B00]">active one</span>. Our{" "}
            <span className="text-[#FD5B00]">office fitness products</span> are
            designed to boost your{" "}
            <span className="text-[#FD5B00]">well-being</span>, increase your{" "}
            <span className="text-[#FD5B00]">energy</span>, and help you achieve
            your <span className="text-[#FD5B00]">health goals</span>, right
            from your desk.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 2xl:gap-10 py-6">
        {sportsData.map((item, index) => (
          <div
            key={index}
            className={`relative rounded-4xl p-5 font-outfit overflow-hidden h-[200px] bg-[#f8f4ec]  text-black flex flex-col justify-between`}
          >
            <h3 className="text-2xl text-[#2A2A2A] font-bold w-44">
              {item.title}
            </h3>
            <div className="flex flex-col">
              <div className="">
                <button className="bg-[#2A2A2A] text-[#F9F4ED] md:hover:bg-[#2a2a2ad8] cursor-pointer px-4 py-2 rounded-full text-sm font-semibold">
                  Buy Now
                </button>
              </div>
              <div className="absolute bottom-0 right-0">
                <Image
                  alt="Product Image"
                  src={item.image}
                  width={200}
                  height={200}
                  className="w-48 md:w-52 object-contain "
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RefreshWorkspace;
