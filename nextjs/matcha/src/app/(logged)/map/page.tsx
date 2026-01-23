"use client";

// import { useState, useEffect } from "react";
import { useMyProfile } from "@/hooks/useProfile";
import UsersMap from "@/components/map/UsersMap";

export default function MapPage() {
  const { data: profile, isLoading, error } = useMyProfile();

  if (error) {
    return <div>Error loading profile: {error.message}</div>;
  }

  if (isLoading || !profile) {
    return <div>Loading profile...</div>;
  }

  return <>
    <UsersMap currentPos={{ lat: profile?.location?.latitude, lng: profile?.location?.longitude }}  />
  </>;
}
