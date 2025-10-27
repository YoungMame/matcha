import { useState, useEffect } from "react";

interface GeolocationState {
  hasAsked: boolean;
  permission: "granted" | "denied" | "prompt";
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  } | null;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("geolocation-permission");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hasAsked: true,
          permission: parsed.permission,
          coordinates: parsed.coordinates || null,
          error: null,
        };
      }
    }
    return {
      hasAsked: false,
      permission: "prompt" as const,
      coordinates: null,
      error: null,
    };
  });

  // Update location on mount and refresh if permission is granted
  useEffect(() => {
    if (state.permission === "granted" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setState((prev) => ({
            ...prev,
            coordinates: coords,
            error: null,
          }));
          localStorage.setItem(
            "geolocation-permission",
            JSON.stringify({
              permission: "granted",
              coordinates: coords,
            })
          );
        },
        (error) => {
          let errorMessage = "Unable to retrieve your location";
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Location permission denied";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = "Location information unavailable";
          } else if (error.code === error.TIMEOUT) {
            errorMessage = "Location request timed out";
          }
          setState((prev) => ({
            ...prev,
            error: errorMessage,
          }));
        }
      );
    }
  }, [state.permission]);

  const requestPermission = () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        hasAsked: true,
        error: "Geolocation is not supported by your browser",
      }));
      localStorage.setItem(
        "geolocation-permission",
        JSON.stringify({
          permission: "denied",
          coordinates: null,
        })
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setState({
          hasAsked: true,
          permission: "granted",
          coordinates: coords,
          error: null,
        });
        localStorage.setItem(
          "geolocation-permission",
          JSON.stringify({
            permission: "granted",
            coordinates: coords,
          })
        );
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information unavailable";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out";
        }

        setState({
          hasAsked: true,
          permission: "denied",
          coordinates: null,
          error: errorMessage,
        });
        localStorage.setItem(
          "geolocation-permission",
          JSON.stringify({
            permission: "denied",
            coordinates: null,
          })
        );
      }
    );
  };

  const denyPermission = () => {
    setState({
      hasAsked: true,
      permission: "denied",
      coordinates: null,
      error: null,
    });
    localStorage.setItem(
      "geolocation-permission",
      JSON.stringify({
        permission: "denied",
        coordinates: null,
      })
    );
  };

  return {
    ...state,
    requestPermission,
    denyPermission,
  };
};
