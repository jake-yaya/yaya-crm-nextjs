"use client";
import Image from "next/image";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("order");

  const handleSearch = (e) => {
    e.preventDefault();
    router.push("/" + searchType + "/" + search);
    // You can route or call API here
  };
  if (session) console.log(session.user.image);
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Image src="https://crm.efmt.app/assets/img/logo.png" alt="Logo" width={40} height={40} className="cursor-pointer" />
            <span className="ml-2 font-bold text-lg">CRM</span>
          </div>

          {/* Search bar */}
          <div className="flex-1 px-4">
            <form onSubmit={handleSearch} className="flex">
              {/* Dropdown */}
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="border border-gray-300 rounded-l-full px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="order">Order</option>
                <option value="item">Item</option>
                <option value="customer">Customer</option>
              </select>

              {/* Search input */}
              <input
                type="text"
                placeholder={`Search by ${searchType}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-t border-b border-gray-300 rounded-r-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>

          {/* Profile */}
          <div className="flex items-center space-m-4">
            {session && session.user ? (
              <Image src={session.user.image} alt="Profile" width={40} height={40} className="rounded-full cursor-pointer" />
            ) : (
              <p className="mb-4">Loading...</p>
            )}

            {/* <p className="mb-4">{session?.user?.name}</p> */}
          </div>
          <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 mx-3 rounded hover:bg-red-600">
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
