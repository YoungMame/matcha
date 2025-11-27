"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Location } from "../types/location";
import axios, { Axios } from "axios";
import { useQuery } from "@tanstack/react-query";

interface MeContextType {
    id: number;
    setId: (id: number) => void;
    profilePictureUrls: string[];
    setProfilePictureUrls: (urls: string[]) => void;
    profilePictureIndex: number | null;
    setProfilePictureIndex: (index: number | null) => void;
    bio: string;
    setBio: (bio: string) => void;
    tags: string[];
    setTags: (tags: string[]) => void;
    email: string;
    setEmail: (email: string) => void;
    username: string;
    setUsername: (username: string) => void;
    firstName: string;
    setFirstName: (firstName: string) => void;
    lastName: string;
    setLastName: (lastName: string) => void;
    birthdate: Date | null;
    setBirthdate: (birthdate: Date | null) => void;
    location: Location | null;
    setLocation: (location: Location | null) => void;
    orientation: string;
    setOrientation: (orientation: string) => void;
    gender: string;
    setGender: (gender: string) => void;
    isVerified: boolean;
    setIsVerified: (isVerified: boolean) => void;
    isProfileCompleted: boolean;
    setIsProfileCompleted: (isProfileCompleted: boolean) => void;
    fameRate: number;
    setFameRate: (fameRate: number) => void;

    error: string | null;
    isLoading: boolean;
    refresh: () => void;
}

const MeContext = createContext<MeContextType | undefined>(undefined);

type Me = {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePictures: string[];
  profilePictureIndex: number | null;
  bio: string;
  tags: string[];
  bornAt: string;
  gender: string;
  orientation: string;
  isVerified: boolean;
  isProfileCompleted: boolean;
  fameRate: number;
  location: Location | null;
  createdAt: string;
}

function usePosts() {
  const query = useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<Me> => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/private/user/me/profile`, {
        withCredentials: true,
      });
      return response.data;
    },
  });
  if (query.error) {
    query.error = new Error("Failed to fetch user profile");
  }
  return query;
}

export function MeProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<number>(0);
  const [profilePictureUrls, setProfilePictureUrls] = useState<string[]>([]);
  const [profilePictureIndex, setProfilePictureIndex] = useState<number | null>(null);
  const [bio, setBio] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [orientation, setOrientation] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isProfileCompleted, setIsProfileCompleted] = useState<boolean>(false);
  const [fameRate, setFameRate] = useState<number>(0);

  const { data, error, isLoading, refetch } = usePosts();

  useEffect(() => {
    if (data) {
      setId(data.id);
      setEmail(data.email);
      setUsername(data.username);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setProfilePictureUrls(data.profilePictures);
      setProfilePictureIndex(data.profilePictureIndex);
      setBio(data.bio);
      setTags(data.tags);
      setBirthdate(new Date(data.bornAt));
      setLocation(data.location);
      setOrientation(data.orientation);
      setGender(data.gender);
    }
  }, [data]);

  return (
    <MeContext.Provider 
      value={{
        id,
        setId,
        profilePictureUrls,
        setProfilePictureUrls,
        profilePictureIndex,
        setProfilePictureIndex,
        bio,
        setBio,
        tags,
        setTags,
        email,
        setEmail,
        username,
        setUsername,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        birthdate,
        setBirthdate,
        orientation,
        setOrientation,
        gender,
        setGender,
        location,
        setLocation,
        isVerified,
        setIsVerified,
        isProfileCompleted,
        setIsProfileCompleted,
        fameRate,
        setFameRate,

        error: error?.message || null,
        isLoading,
        refresh: refetch,
      }}
    >
      {children}
    </MeContext.Provider>
  );
}

export function useMe() {
  const context = useContext(MeContext);
  if (context === undefined) {
    throw new Error("useMe must be used within a MeProvider");
  }
  return context;
}
