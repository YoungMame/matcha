"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import Typography from "@/components/common/Typography";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import ProfileView from "@/components/profile/ProfileView";
import MatchingModal from "@/components/browsing/MatchingModal";
import { UserProfile } from "@/types/userProfile";
import { ConnectionStatus } from "@/types/profileInteraction";
import { useBrowsing as useBrowsingContext } from "@/contexts/BrowsingContext";
import { 
  useUserProfile, 
  useLikeProfile, 
  useBlockProfile, 
  useReportProfile, 
  useRecordProfileVisit 
} from "@/hooks/useUserProfile";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { selectedMatchUserId, closeMatchModal } = useBrowsingContext();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Match modal state
  const [matchModalUser, setMatchModalUser] = useState<UserProfile | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  // Fetch profile data
  const { data: profileData, isLoading, error } = useUserProfile(userId || "");
  
  // Mutations
  const { mutate: recordVisit } = useRecordProfileVisit();
  const { mutate: likeProfile, isPending: isLiking } = useLikeProfile();
  const { mutate: blockProfile, isPending: isBlocking } = useBlockProfile();
  const { mutate: reportProfile, isPending: isReporting } = useReportProfile();

  // Record visit when profile loads
  useEffect(() => {
    if (userId && profileData) {
      recordVisit(userId);
    }
  }, [userId, profileData, recordVisit]);

  // Convert API profile data to UserProfile type
  const profile: UserProfile | null = profileData ? {
    id: profileData.id,
    username: profileData.username,
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    birthday: profileData.birthday,
    biography: profileData.bio,
    interests: profileData.interests,
    profilePicture: profileData.profilePicture,
    additionalPictures: profileData.additionalPictures,
    distance: profileData.location.distance || 0,
    fame: profileData.fame,
    gender: profileData.gender,
    interestedInGenders: [],
  } : null;

  // Watch for match modal state from context
  useEffect(() => {
    if (selectedMatchUserId && profileData) {
      setMatchModalUser(profile);
      setIsMatchModalOpen(true);
    }
  }, [selectedMatchUserId, profileData, profile]);

  const handleToggleLike = async () => {
    if (!userId) return;
    
    return new Promise<void>((resolve, reject) => {
      likeProfile(userId, {
        onSuccess: (data) => {
          if (data.matched) {
            setSuccessMessage("🎉 Félicitations ! Vous êtes maintenant connectés. Vous pouvez commencer à discuter !");
          } else {
            setSuccessMessage("❤️ Like envoyé !");
          }
          setTimeout(() => setSuccessMessage(null), 3000);
          resolve();
        },
        onError: () => {
          setSuccessMessage("Erreur lors du like");
          setTimeout(() => setSuccessMessage(null), 3000);
          reject();
        },
      });
    });
  };

  const handleBlock = async () => {
    if (!userId) return;
    
    return new Promise<void>((resolve, reject) => {
      blockProfile(userId, {
        onSuccess: () => {
          setSuccessMessage("✅ Utilisateur bloqué. Il n'apparaîtra plus dans vos recherches.");
          setTimeout(() => {
            router.push("/browsing");
            resolve();
          }, 2000);
        },
        onError: () => {
          setSuccessMessage("Erreur lors du blocage");
          setTimeout(() => setSuccessMessage(null), 3000);
          reject();
        },
      });
    });
  };

  const handleReport = async () => {
    if (!userId) return;
    
    return new Promise<void>((resolve, reject) => {
      reportProfile({ userId }, {
        onSuccess: () => {
          setSuccessMessage("✅ Signalement envoyé. Notre équipe examinera ce profil.");
          setTimeout(() => setSuccessMessage(null), 3000);
          resolve();
        },
        onError: () => {
          setSuccessMessage("Erreur lors du signalement");
          setTimeout(() => setSuccessMessage(null), 3000);
          reject();
        },
      });
    });
  };

  const handleMatchModalClose = () => {
    setIsMatchModalOpen(false);
    closeMatchModal();
    setTimeout(() => setMatchModalUser(null), 300);
  };

  const handleMatchModalLike = (userId: string) => {
    likeProfile(userId, {
      onSuccess: (data) => {
        if (data.matched) {
          console.log("It's a match!", userId);
        }
      },
    });
  };

  const handleMatchModalPass = (userId: string) => {
    // Pass logic could be implemented here
    console.log("Passed user from match modal:", userId);
  };

  if (!userId) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Container size="xl" className="py-8">
          <div className="space-y-4 max-w-5xl mx-auto">
            <Alert variant="error">Aucun profil spécifié</Alert>
            <Button variant="primary" onClick={() => router.push("/browsing")}>
              Retour à la recherche
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Container size="xl" className="py-8">
          <div className="flex items-center justify-center h-64">
            <Typography variant="h3" color="secondary">
              Chargement du profil...
            </Typography>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !profile) {
    const errorMessage = error ? (error as any)?.response?.data?.error || error.message || "Erreur lors du chargement du profil" : "Profil non trouvé";
    
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Container size="xl" className="py-8">
          <div className="space-y-4 max-w-5xl mx-auto">
            <Alert variant="error">{errorMessage}</Alert>
            <Button variant="primary" onClick={() => router.push("/browsing")}>
              Retour à la recherche
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <Container size="full" className="py-4">
          {/* Success Message */}
          {successMessage && (
            <Alert variant="success" className="animate-fade-in">
              {successMessage}
            </Alert>
          )}

          {/* Profile View */}
          <ProfileView
            profile={profile}
            connectionStatus={(profileData?.isOnline ? 'online' : 'offline') as ConnectionStatus}
            isLiked={false} // Will be determined by API
            isOnline={profileData?.isOnline || false}
            lastSeenAt={profileData?.lastSeen ? new Date(profileData.lastSeen) : undefined}
            hasProfilePicture={true} // Assuming current user has profile picture
            onToggleLike={handleToggleLike}
            onBlock={handleBlock}
            onReport={handleReport}
          />

          {/* Matching Modal */}
          <MatchingModal
            isOpen={isMatchModalOpen}
            onClose={handleMatchModalClose}
            user={matchModalUser}
            onLike={handleMatchModalLike}
            onPass={handleMatchModalPass}
            isFromMatch={true}
          />
      </Container>
    </div>
  );
}
