

function Settings() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-600">Manage your store settings</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <h2 className="text-lg font-medium text-gray-900">Store Information</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Update your store details and preferences.
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Store Name
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FD5B00] focus:ring focus:ring-[#FD5B00] focus:ring-opacity-50"
                                    defaultValue="My Awesome Store"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Store Email
                                </label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FD5B00] focus:ring focus:ring-[#FD5B00] focus:ring-opacity-50"
                                    defaultValue="contact@myawesomestore.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Currency
                                </label>
                                <select className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#FD5B00] focus:ring focus:ring-[#FD5B00] focus:ring-opacity-50">
                                    <option>USD ($)</option>
                                    <option>EUR (€)</option>
                                    <option>GBP (£)</option>
                                </select>
                            </div>

                            <div className="pt-5">
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FD5B00]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-[#FD5B00] hover:bg-[#e05100] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FD5B00]"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings