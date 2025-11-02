import Image from "next/image"

function page() {
    return (
        <div className="w-full h-auto bg-[#f9f4ed] flex flex-col px-5 lg:px-10 py-7 lg:gap-10">
            <div className="w-full bg-white p-5 font-outfit rounded-2xl h-auto flex lg:p-7 flex-col md:flex-row gap-8 lg:gap-14">
                {/* left container */}
                <div className="flex flex-col w-full h-auto gap-3 md:w-1/2 lg:px-3">
                    <h1 className="font-bold text-3xl lg:text-5xl">Contact Us</h1>
                    <p className="text-[#656565] text-xs font-semibold lg:text-base">Learn more about our products and services to get a better experience in shopping at our website. Please complete this form to get the latest information from us. Our Customer Service is available on 24/7. </p>
                    <div className="w-full h-auto mt-10 flex flex-col gap-4 lg:gap-6">
                        <div className="w-full h-auto flex gap-4 items-center">
                            <Image src='/office.png' alt="office" width={100} height={100} className="w-10 object-contain" />
                            <div className="w-full h-auto flex flex-col gap-1">
                                <h1 className="font-semibold text-black text-xl lg:text-2xl">Our office</h1>
                                <p className="text-[#656565] text-xs lg:text-lg lg:font-semibold">SHOP NO- 3 , Shree Ram Market , Bilaspur chowk, GURUGRAM, Haryana 122413</p>
                            </div>
                        </div>
                        <div className="w-full h-auto flex gap-4 items-center">
                            <Image src='/phone.png' alt="office" width={100} height={100} className="w-10 object-contain" />
                            <div className="w-full h-auto flex flex-col gap-1">
                                <h1 className="font-semibold text-black text-xl lg:text-2xl">Phone Number</h1>
                                <p className="text-[#656565] text-xs lg:text-lg lg:font-semibold">+91 9085857070</p>
                            </div>
                        </div>
                        <div className="w-full h-auto flex gap-4 items-center">
                            <Image src='/office.png' alt="office" width={100} height={100} className="w-10 object-contain" />
                            <div className="w-full h-auto flex flex-col gap-1">
                                <h1 className="font-semibold text-black text-xl lg:text-2xl">Email</h1>
                                <p className="text-[#656565] text-xs lg:text-lg lg:font-semibold">customercare@suppkart.com</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* right container */}
                <div className="w-full bg-[#2A2A2A] px-5 rounded-2xl h-auto md:justify-between lg:px-10 flex flex-col py-10 gap-6 md:w-1/2">
                    <div className="w-full h-auto flex flex-col gap-6 xl:gap-8">
                        <div className="w-full h-auto flex flex-col gap-5">
                            {/* Name Field */}
                            <div className="w-full h-auto flex flex-col gap-3">
                                <label htmlFor="name" className="text-[#F8F8FA] lg:text-lg">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    id="name"
                                    placeholder="Enter Your Name"
                                    className="w-full h-10 bg-[#F8F8FA] outline-none xl:h-14 rounded-2xl p-3"
                                />
                            </div>
                            {/* Email Field */}
                            <div className="w-full h-auto flex flex-col gap-3">
                                <label htmlFor="email" className="text-[#F8F8FA] lg:text-lg">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    id="email"
                                    placeholder="Enter Your Email"
                                    className="w-full h-10 bg-[#F8F8FA] outline-none xl:h-14 rounded-2xl p-3"
                                />
                            </div>
                            {/* Phone Field */}
                            <div className="w-full h-auto flex flex-col gap-3">
                                <label htmlFor="phone" className="text-[#F8F8FA] lg:text-lg">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    required
                                    id="phone"
                                    placeholder="Enter Your Phone Number"
                                    className="w-full h-10 bg-[#F8F8FA] outline-none xl:h-14 rounded-2xl p-3"
                                />
                            </div>
                            {/* Message Field */}
                            <div className="w-full h-auto flex flex-col gap-3">
                                <label htmlFor="message" className="text-[#F8F8FA] lg:text-lg">
                                    Message
                                </label>
                                <textarea
                                    required
                                    id="message"
                                    placeholder="Write Something here.."
                                    className="w-full h-40 resize-none bg-[#F8F8FA] outline-none rounded-2xl p-3"
                                />
                            </div>
                        </div>
                    </div>

                    <button className="bg-[#FD5B00] text-white font-semibold rounded-2xl text-center xl:py-3 cursor-pointer md:hover:bg-[#fd5d00c9] xl:text-xl py-2">
                        Send Message
                    </button>
                </div>
            </div>
            <div className='w-full h-auto mx-auto my-10'>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2971.752999490835!2d77.42819344043306!3d28.606530564406448!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjjCsDM2JzIxLjkiTiA3N8KwMjUnNDcuNSJF!5e0!3m2!1sen!2sin!4v1745302164096!5m2!1sen!2sin"
                    className='w-full rounded-3xl h-40 sm:h-72 md:h-96 xl:h-[450px]'
                    style={{ border: 2 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
        </div>
    )
}

export default page