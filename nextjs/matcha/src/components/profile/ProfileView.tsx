"use client";

import { UserProfile } from "@/types/userProfile";
import { ConnectionStatus } from "@/types/profileInteraction";
import Card from "@/components/common/Card";
import Typography from "@/components/common/Typography";
import Badge from "@/components/common/Badge";
import ProfileGallery from "./ProfileGallery";
import OnlineStatus from "./OnlineStatus";
import FameRating from "./FameRating";
import ConnectionStatusBadge from "./ConnectionStatusBadge";
import ProfileActions from "./ProfileActions";
import { differenceInYears } from "date-fns";
import Image from "next/image";

interface ProfileViewProps {
  profile: UserProfile;
  connectionStatus: ConnectionStatus;
  isLiked: boolean;
  isOnline: boolean;
  lastSeenAt?: Date;
  hasProfilePicture: boolean;
  onToggleLike: () => Promise<void>;
  onBlock: () => Promise<void>;
  onReport: () => Promise<void>;
}

export default function ProfileView({
  profile,
  connectionStatus,
  isLiked,
  isOnline,
  lastSeenAt,
  hasProfilePicture,
  onToggleLike,
  onBlock,
  onReport,
}: ProfileViewProps) {
  const age = differenceInYears(new Date(), new Date(profile.birthday));

  return (
    <div className="w-full">
      <Card variant="elevated" padding="lg" className="bg-white dark:bg-gray-800">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side - Profile Picture */}
          <div className="shrink-0">
            <ProfileGallery
              profilePicture={profile.profilePicture}
              additionalPictures={profile.additionalPictures}
              userName={profile.firstName}
            />
            
          </div>

          {/* Right Side - Profile Info */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-1">
                <Typography variant="h1" color="primary" className="text-2xl font-semibold">
                  {profile.firstName}{profile.lastName ? ` ${profile.lastName}` : ""}
                </Typography>
                
                {/* Like Button */}
                <button
                  onClick={onToggleLike}
                  disabled={!hasProfilePicture}
                  className={`p-3 rounded-full transition-all ${
                    isLiked
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={
                    !hasProfilePicture
                      ? "Vous devez avoir une photo de profil pour liker"
                      : isLiked
                      ? "Retirer le like"
                      : "Liker"
                  }
                >
                  {isLiked ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <Typography variant="body" color="secondary" className="uppercase text-xs font-medium">
                  {profile.gender === "men" ? "Homme" : profile.gender === "women" ? "Femme" : "Autre"}
                </Typography>
                <Typography variant="body" color="secondary">
                  {profile.firstName} {age > 0 ? age : "?"}
                </Typography>
              </div>

              <div className="flex items-center gap-2">
                <OnlineStatus isOnline={isOnline} lastSeenAt={lastSeenAt} />
              </div>

              {profile.distance > 0 && (
                <Typography variant="small" color="secondary" className="mt-2">
                  📍 À {profile.distance} km de vous
                </Typography>
              )}
            </div>

            {/* About Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Typography variant="h3" color="primary" className="text-lg font-semibold">
                  À propos
                </Typography>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <Typography variant="body" color="secondary" className="leading-relaxed">
                {profile.biography || "Aucune biographie renseignée"}
              </Typography>
            </div>

         

            {/* Interests Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Typography variant="h3" color="primary" className="text-lg font-semibold">
                  Centres d&apos;intérêt
                </Typography>
                <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.interests.length > 0 ? (
                  profile.interests.map((interest, idx) => (
                    <Badge key={idx} variant="primary" size="medium" className="px-3 py-1.5">
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <Typography variant="small" color="secondary" className="italic">
                    Aucun centre d&apos;intérêt renseigné
                  </Typography>
                )}
              </div>
            </div>

            {/* Physical Attributes Section */}
            <div>
              <Typography variant="h3" color="primary" className="text-lg font-semibold mb-3">
                Profil
              </Typography>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Gender */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <Typography variant="caption" color="secondary" className="text-xs">
                      Genre
                    </Typography>
                    <Typography variant="small" color="primary" className="font-medium">
                      {profile.gender === "men" ? "Homme" : profile.gender === "women" ? "Femme" : "Autre"}
                    </Typography>
                  </div>
                </div>

                {/* Age */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <Typography variant="caption" color="secondary" className="text-xs">
                      Âge
                    </Typography>
                    <Typography variant="small" color="primary" className="font-medium">
                      {age} ans
                    </Typography>
                  </div>
                </div>

                {/* Looking for */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div className="flex-1">
                    <Typography variant="caption" color="secondary" className="text-xs">
                      Recherche
                    </Typography>
                    <div className="flex gap-1 mt-1">
                      {profile.interestedInGenders.map((gender, idx) => (
                        <Typography key={idx} variant="small" color="primary" className="font-medium">
                          {gender === "men" ? "Homme" : gender === "women" ? "Femme" : "Autre"}
                          {idx < profile.interestedInGenders.length - 1 && ", "}
                        </Typography>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <ProfileActions
                userId={profile.id}
                isLiked={isLiked}
                isConnected={connectionStatus === "connected"}
                hasProfilePicture={hasProfilePicture}
                onToggleLike={onToggleLike}
                onBlock={onBlock}
                onReport={onReport}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
