"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "./Button";
import Typography from "./Typography";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import SignInModal from "@/components/homepage/SignUpModal";

interface User {
  id: string;
  username: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [language, setLanguage] = useState("FR");

  // Determine which page we're on
  const isHomePage = pathname === "/";
  const isOnboarding = pathname?.startsWith("/onboarding");
  const isBrowsing = pathname?.startsWith("/browsing");
  const showLanguage = isOnboarding || isBrowsing;

  // Fetch current user data
//   const { data: userData } = useQuery<{ user: User }>({
//     queryKey: ["user"],
//     queryFn: async () => {
//       const response = await axios.get("/api/auth/me");
//       return response.data;
//     },
//     retry: false,
//     enabled: !isHomePage, // Only fetch if not on home page
//   });

	const userData:any = undefined;

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLanguageChange = () => {
    // Toggle between FR and EN (you can expand this later)
    setLanguage(language === "FR" ? "EN" : "FR");
    // TODO: Implement actual language change logic
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/Tinder.svg"
                alt="Matcha Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <Typography variant="h3" className="text-pink-500">
                Matcha
              </Typography>
            </Link>

            {/* Right side - Conditional content */}
            <div className="flex items-center gap-4">
              {isHomePage && (
                <>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="outline"
                    size="small"
                  >
                    S'inscrire
                  </Button>
                  <Button
                    onClick={() => router.push("/login")}
                    variant="gradient"
                    size="small"
                  >
                    Se connecter
                  </Button>
                </>
              )}

              {!isHomePage && userData?.user && (
                <>
                  <Typography color="secondary" className="hidden sm:block">
                    Welcome, <strong>{userData?.user?.username ?? "username"}</strong>
                  </Typography>
                  <Button
                    onClick={handleLogout}
                    variant="primary"
                    size="small"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Logout
                  </Button>
                </>
              )}

              {showLanguage && (
                <button
                  onClick={handleLanguageChange}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  aria-label="Change language"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  <span>{language}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sign In Modal */}
      <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
