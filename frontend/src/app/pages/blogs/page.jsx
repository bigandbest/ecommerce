import Image from "next/image"

function page() {

    const blogs = [
        {
            title: "Daily movements in major indices",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an u",
            category: "Nutrients",
            date: "19.06.2024",
            image: ""
        },
        {
            title: "Daily movements in major indices",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an u",
            category: "Nutrients",
            date: "19.06.2024",
            image: ""
        },
        {
            title: "Daily movements in major indices",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an u",
            category: "Nutrients",
            date: "19.06.2024",
            image: ""
        },
        {
            title: "Daily movements in major indices",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an u",
            category: "Nutrients",
            date: "19.06.2024",
            image: ""
        },
        {
            title: "Daily movements in major indices",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an u",
            category: "Nutrients",
            date: "19.06.2024",
            image: ""
        },
        {
            title: "Daily movements in major indices",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an u",
            category: "Nutrients",
            date: "19.06.2024",
            image: ""
        },
        {
            title: "Daily movements in major indices",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an u",
            category: "Nutrients",
            date: "19.06.2024",
            image: ""
        },
        {
            title: "Daily movements in major indices",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an u",
            category: "Nutrients",
            date: "19.06.2024",
            image: ""
        },
        {
            title: "Daily movements in major indices",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an u",
            category: "Nutrients",
            date: "19.06.2024",
            image: ""
        }
    ]

    return (
        <div className="w-full h-auto flex flex-col px-5 lg:px-10 py-8 lg:py-14 gap-8 lg:gap-10">
            <div className="w-full h-auto flex flex-col font-outfit gap-4">
                <h1 className="font-bold text-3xl text-[#292833] text-center lg:text-5xl 2xl:text-6xl">News <span className="text-[#FD5B00]">Articles & Blog</span> Updates</h1>
                <p className="text-[#292833] text-sm md:text-xl xl:text-2xl font-semibold text-center">
                    It is a long established fact that a reader will be distracted <br />
                    by the readable content of a page when looking
                </p>
            </div>
            <div className="w-full h-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                {
                    blogs.map((item, index) => (
                        <div className="w-full h-auto flex flex-col p-3 gap-3 font-outfit xl:gap-4 cursor-pointer md:hover:scale-105 md:hover:shadow-lg transition-all shadow duration-300 ease-in-out rounded-3xl" key={index}>
                            <div className="w-full h-60 bg-[#8B8B8B] rounded-3xl relative">
                                {/* <Image src={item.image} width={500} height={500} alt='blog' className='object-contain ' /> */}
                                <span className="absolute top-4 left-4 rounded-xl px-4 py-2 bg-[#FF7558] font-semibold border border-[#FD5B00] text-[#292833]">{item.category}</span>
                            </div>
                            <div className="w-full h-auto flex justify-between items-center">
                                <span className="rounded-full px-4 py-1 bg-black font-semibold text-white">{item.category}</span>
                                <span className="font-medium text-[#2A2A2A]">{item.date}</span>
                            </div>
                            <h1 className="text-[#292833] font-semibold text-lg xl:text-2xl">{item.title}</h1>
                            <p className="text-[#656565] font-semibold text-sm xl:text-base">{item.description}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default page