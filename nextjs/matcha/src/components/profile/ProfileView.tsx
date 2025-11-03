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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Photos */}
      <div>
        <ProfileGallery
          profilePicture={profile.profilePicture}
          additionalPictures={profile.additionalPictures}
          userName={profile.firstName}
        />
      </div>

      {/* Right Column - Profile Info */}
      <div className="space-y-6">
        {/* Header with Name and Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Typography variant="h1" color="primary">
              {profile.firstName} {profile.lastName}
            </Typography>
            <ConnectionStatusBadge status={connectionStatus} />
          </div>
          
          <div className="flex items-center gap-4">
            <Typography variant="h3" color="secondary">
              {age} ans
            </Typography>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <OnlineStatus isOnline={isOnline} lastSeenAt={lastSeenAt} />
          </div>
          
          {profile.distance > 0 && (
            <Typography variant="small" color="secondary">
              📍 À {profile.distance} km de vous
            </Typography>
          )}
        </div>

        {/* Fame Rating */}
        <Card variant="outlined" padding="md">
          <FameRating fame={profile.fame} />
        </Card>

        {/* Biography */}
        <Card variant="outlined" padding="md">
          <Typography variant="h3" color="primary" className="mb-3">
            À propos
          </Typography>
          <Typography variant="body" color="secondary">
            {profile.biography}
          </Typography>
        </Card>

        {/* Gender & Preferences */}
        <Card variant="outlined" padding="md">
          <Typography variant="h3" color="primary" className="mb-3">
            Profil
          </Typography>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Typography variant="small" color="secondary">
                Genre:
              </Typography>
              <Badge variant="secondary" size="small">
                {profile.gender === "male" ? "Homme" : profile.gender === "female" ? "Femme" : "Autre"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Typography variant="small" color="secondary">
                Recherche:
              </Typography>
              {profile.interestedInGenders.map((gender, idx) => (
                <Badge key={idx} variant="secondary" size="small">
                  {gender === "male" ? "Homme" : gender === "female" ? "Femme" : "Autre"}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Interests */}
        <Card variant="outlined" padding="md">
          <Typography variant="h3" color="primary" className="mb-3">
            Centres d&apos;intérêt
          </Typography>
          <div className="flex flex-wrap gap-2">
            {profile.interests.length > 0 ? (
              profile.interests.map((interest, idx) => (
                <Badge key={idx} variant="primary" size="medium">
                  {interest}
                </Badge>
              ))
            ) : (
              <Typography variant="small" color="secondary">
                Aucun centre d&apos;intérêt renseigné
              </Typography>
            )}
          </div>
        </Card>

        {/* Actions */}
        <Card variant="elevated" padding="md">
          <ProfileActions
            userId={profile.id}
            isLiked={isLiked}
            isConnected={connectionStatus === "connected"}
            hasProfilePicture={hasProfilePicture}
            onToggleLike={onToggleLike}
            onBlock={onBlock}
            onReport={onReport}
          />
        </Card>
      </div>
    </div>
  );
}
