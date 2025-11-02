import Link from 'next/link';
import { FaArrowLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";

function page() {
    return (
        <div className='w-full h-auto flex flex-col px-5 lg:px-10 py-8 gap-10'>
            <div className='w-full h-auto flex gap-3 lg:gap-5 flex-wrap items-center font-outfit'>
                <Link href={'/'} className='p-3 bg-[#2A2A2A] text-white rounded-full'>
                    <FaArrowLeft size={20} />
                </Link>
                <Link href={'/'} className='text-[#2F294D] font-semibold lg:text-lg'>Home</Link>
                <span className='text-[#2F294D] font-semibold'>
                    <FaAngleRight size={20} />
                </span>
                <span className='text-[#2F294D] font-semibold lg:text-lg'>Terms and Conditions</span>
                <span className='text-[#2F294D] font-semibold'>
                    <FaAngleRight size={20} />
                </span>
                <span className='text-[#FF7558] font-semibold lg:text-lg'>Suppkart</span>
            </div>
            <div className='w-full h-auto flex flex-col gap-3 font-outfit mb-10 lg:gap-8'>
                <div className='w-full h-auto flex flex-col gap-3 lg:gap-5'>
                    <h1 className='text-xl font-bold lg:text-3xl text-[#404040]'>Terms and Conditions</h1>
                    <p className='font-semibold text-[#8B8B8B] lg:text-xl'>Welcome to Suppkart! By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before making any purchases or using any of our services.</p>
                </div>
                <div className='w-full h-auto flex flex-col gap-3 lg:gap-5'>
                    <h1 className='text-xl font-bold lg:text-3xl text-[#404040]'>Terms and Conditions</h1>
                    <p className='font-semibold text-[#8B8B8B] lg:text-xl'>Welcome to Suppkart! By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before making any purchases or using any of our services.</p>
                </div>
                <div className='w-full h-auto flex flex-col gap-3 lg:gap-5'>
                    <h1 className='text-xl font-bold lg:text-3xl text-[#404040]'>Terms and Conditions</h1>
                    <p className='font-semibold text-[#8B8B8B] lg:text-xl'>Welcome to Suppkart! By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before making any purchases or using any of our services.</p>
                </div>
                <div className='w-full h-auto flex flex-col gap-3 lg:gap-5'>
                    <h1 className='text-xl font-bold lg:text-3xl text-[#404040]'>Terms and Conditions</h1>
                    <p className='font-semibold text-[#8B8B8B] lg:text-xl'>Welcome to Suppkart! By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before making any purchases or using any of our services.</p>
                </div>
                <div className='w-full h-auto flex flex-col gap-3 lg:gap-5'>
                    <h1 className='text-xl font-bold lg:text-3xl text-[#404040]'>Terms and Conditions</h1>
                    <p className='font-semibold text-[#8B8B8B] lg:text-xl'>Welcome to Suppkart! By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before making any purchases or using any of our services.</p>
                </div>
                <div className='w-full h-auto flex flex-col gap-3 lg:gap-5'>
                    <h1 className='text-xl font-bold lg:text-3xl text-[#404040]'>Terms and Conditions</h1>
                    <p className='font-semibold text-[#8B8B8B] lg:text-xl'>Welcome to Suppkart! By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before making any purchases or using any of our services.</p>
                </div>
                <div className='w-full h-auto flex flex-col gap-3 lg:gap-5'>
                    <h1 className='text-xl font-bold lg:text-3xl text-[#404040]'>Terms and Conditions</h1>
                    <p className='font-semibold text-[#8B8B8B] lg:text-xl'>Welcome to Suppkart! By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before making any purchases or using any of our services.</p>
                </div>
            </div>
        </div>
    )
}

export default page