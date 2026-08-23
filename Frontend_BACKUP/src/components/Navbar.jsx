import { Bell, Search, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <div className="bg-white shadow-sm h-20 px-8 flex items-center justify-between">

      <div>
      
        <p className="text-slate-500">
          EndpointIQ AI Platform
        </p>
      </div>

      <div className="flex items-center gap-6">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            placeholder="Search Device, User..."
            className="pl-10 pr-4 py-2 w-80 rounded-xl border border-gray-300"
          />

        </div>

        <Bell
          className="cursor-pointer"
          size={22}
        />

        <UserCircle
          className="cursor-pointer"
          size={34}
        />

      </div>

    </div>
  );
}