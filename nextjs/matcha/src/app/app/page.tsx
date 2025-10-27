"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Typography from "@/components/common/Typography";
import { useGeolocation } from "@/hooks/useGeolocation";
import LocationPermissionModal from "@/components/app/LocationPermissionModal";

interface User {
  id: string;
  username: string;
}

export default function AppPage() {
  const router = useRouter();
  const {
    hasAsked,
    permission,
    coordinates,
    requestPermission,
    denyPermission,
  } = useGeolocation();

  // Fetch current user data
  const { data, isLoading, error } = useQuery<{ user: User }>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await axios.get("/api/auth/me");
      return response.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <Typography color="secondary" className="mt-4">
            Loading...
          </Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Typography variant="h2" color="error">
            Authentication Error
          </Typography>
          <Typography color="secondary" className="mt-2">
            Please try logging in again.
          </Typography>
          <div className="mt-4">
            <button
              onClick={() => router.push("/")}
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 underline"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <Typography variant="h2" className="mb-4">
              Protected Content
            </Typography>
            <Typography color="secondary" className="mb-4">
              This page can only be accessed by authenticated users.
            </Typography>
            <div className="border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-4">
              <div className="flex">
                <div className="ml-3">
                  <Typography
                    variant="small"
                    className="text-indigo-700 dark:text-indigo-300"
                  >
                    <strong>User Information:</strong>
                  </Typography>
                  <ul className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">
                    <li>ID: {data?.user.id}</li>
                    <li>Username: {data?.user.username}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="mt-6 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex">
                <div className="ml-3">
                  <Typography
                    variant="small"
                    className="text-green-700 dark:text-green-300"
                  >
                    <strong>Location Status:</strong>
                  </Typography>
                  <ul className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <li>Permission: {permission}</li>
                    {coordinates && (
                      <>
                        <li>Latitude: {coordinates.latitude?.toFixed(6)}</li>
                        <li>Longitude: {coordinates.longitude?.toFixed(6)}</li>
                      </>
                    )}
                    {!coordinates && permission === "denied" && (
                      <li>Location access denied</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Location Permission Modal */}
      <LocationPermissionModal
        isOpen={!hasAsked}
        onAllow={requestPermission}
        onDeny={denyPermission}
      />
    </div>
  );
}
