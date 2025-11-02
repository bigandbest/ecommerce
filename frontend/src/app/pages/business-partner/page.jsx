export default function BusinessPartner() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="px-5 xl:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2A2A2A] mb-4">
            Partner with <span className="text-[#FD5B00]">Big&Best Mart</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join India's fastest-growing grocery platform and expand your business reach
          </p>
        </div>

        {/* Partnership Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-2xl font-bold mb-4">Become a Seller</h3>
            <p className="text-gray-600 mb-6">List your products and reach millions of customers across India</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Zero listing fee</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Marketing support</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Easy inventory management</span>
              </li>
            </ul>
            <button className="w-full bg-[#FD5B00] text-white py-3 rounded-lg font-semibold hover:bg-[#e54f00]">
              Start Selling
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-2xl font-bold mb-4">Delivery Partner</h3>
            <p className="text-gray-600 mb-6">Join our delivery network and earn flexible income</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Flexible working hours</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Competitive earnings</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Insurance coverage</span>
              </li>
            </ul>
            <button className="w-full bg-[#FD5B00] text-white py-3 rounded-lg font-semibold hover:bg-[#e54f00]">
              Join as Delivery Partner
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold mb-4">Franchise Partner</h3>
            <p className="text-gray-600 mb-6">Open a Big&Best Mart store in your area</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Proven business model</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Training & support</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Brand recognition</span>
              </li>
            </ul>
            <button className="w-full bg-[#FD5B00] text-white py-3 rounded-lg font-semibold hover:bg-[#e54f00]">
              Enquire Now
            </button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Get in Touch</h2>
          <form className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Full Name"
              className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FD5B00]"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FD5B00]"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FD5B00]"
            />
            <select className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FD5B00]">
              <option>Partnership Type</option>
              <option>Seller</option>
              <option>Delivery Partner</option>
              <option>Franchise</option>
            </select>
            <textarea
              placeholder="Tell us about your business"
              rows="4"
              className="md:col-span-2 p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FD5B00]"
            ></textarea>
            <button
              type="submit"
              className="md:col-span-2 bg-[#FD5B00] text-white py-4 rounded-lg font-semibold hover:bg-[#e54f00]"
            >
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}