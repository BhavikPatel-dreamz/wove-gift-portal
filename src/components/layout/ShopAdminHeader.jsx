import { Search } from "lucide-react";

const ShopAdminHeader = ({ shopParam }) => {
    return (
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="relative max-w-md flex gap-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="text-right">
                        <span className="text-sm font-medium text-gray-700 block">
                            Welcome, {shopParam}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ShopAdminHeader;
