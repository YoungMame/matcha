"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/common/Container";
import Typography from "@/components/common/Typography";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import ProfileView from "@/components/profile/ProfileView";
import MatchingModal from "@/components/browsing/MatchingModal";
import { mockUserProfiles } from "@/mocks/browsing_mocks";
import {
  mockProfileInteractions,
  getConnectionStatus,
  toggleLike,
  blockUser,
  reportUser,
  recordProfileVisit,
  CURRENT_USER_HAS_PROFILE_PICTURE,
} from "@/mocks/profile_mocks";
import { UserProfile } from "@/types/userProfile";
import { ProfileInteraction } from "@/types/profileInteraction";
import { useBrowsing } from "@/contexts/BrowsingContext";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { selectedMatchUserId, closeMatchModal } = useBrowsing();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [interaction, setInteraction] = useState<ProfileInteraction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Match modal state
  const [matchModalUser, setMatchModalUser] = useState<UserProfile | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  // Watch for match modal state from context
  useEffect(() => {
    if (selectedMatchUserId) {
      const user = mockUserProfiles.find((u) => u.id === selectedMatchUserId);
      if (user) {
        setMatchModalUser(user);
        setIsMatchModalOpen(true);
      }
    }
  }, [selectedMatchUserId]);

  useEffect(() => {
    if (!userId) {
      setError("Aucun profil spécifié");
      setIsLoading(false);
      return;
    }

    // Simulate API call to fetch profile
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // Record visit
        await recordProfileVisit(userId);
        
        // Find profile
        const foundProfile = mockUserProfiles.find((p) => p.id === userId);
        if (!foundProfile) {
          setError("Profil non trouvé");
          return;
        }

        setProfile(foundProfile);
        setInteraction(
          mockProfileInteractions[userId] || {
            userId,
            likedByMe: false,
            likedByThem: false,
            blocked: false,
            reported: false,
            isOnline: false,
          }
        );
      } catch (err) {
        setError("Erreur lors du chargement du profil");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleToggleLike = async () => {
    if (!userId) return;
    
    try {
      const updated = await toggleLike(userId);
      setInteraction(updated);
      
      if (updated.likedByMe) {
        if (updated.likedByThem) {
          setSuccessMessage("🎉 Félicitations ! Vous êtes maintenant connectés. Vous pouvez commencer à discuter !");
        } else {
          setSuccessMessage("❤️ Like envoyé !");
        }
      } else {
        setSuccessMessage("Like retiré. Les notifications de cet utilisateur sont désactivées.");
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Erreur lors du like");
    }
  };

  const handleBlock = async () => {
    if (!userId) return;
    
    try {
      const updated = await blockUser(userId);
      setInteraction(updated);
      setSuccessMessage("✅ Utilisateur bloqué. Il n'apparaîtra plus dans vos recherches.");
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "/browsing";
      }, 2000);
    } catch (err) {
      setError("Erreur lors du blocage");
    }
  };

  const handleReport = async () => {
    if (!userId) return;
    
    try {
      const updated = await reportUser(userId);
      setInteraction(updated);
      setSuccessMessage("✅ Signalement envoyé. Notre équipe examinera ce profil.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Erreur lors du signalement");
    }
  };

  const handleMatchModalClose = () => {
    setIsMatchModalOpen(false);
    closeMatchModal();
    setTimeout(() => setMatchModalUser(null), 300);
  };

  const handleMatchModalLike = (userId: string) => {
    console.log("Liked user from match modal:", userId);
    // TODO: Implement like logic
  };

  const handleMatchModalPass = (userId: string) => {
    console.log("Passed user from match modal:", userId);
    // TODO: Implement pass logic
  };

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

  if (error || !profile || !interaction || !userId) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Container size="xl" className="py-8">
          <div className="space-y-4 max-w-5xl mx-auto">
            <Alert variant="error">{error || "Profil non trouvé"}</Alert>
            <Button variant="primary" onClick={() => (window.location.href = "/browsing")}>
              Retour à la recherche
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const connectionStatus = getConnectionStatus(userId);

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <Container size="full" className="py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/browsing")}
            className="inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la recherche
          </Button>

          {/* Success Message */}
          {successMessage && (
            <Alert variant="success" className="animate-fade-in">
              {successMessage}
            </Alert>
          )}

          {/* Profile View */}
          <ProfileView
            profile={profile}
            connectionStatus={connectionStatus}
            isLiked={interaction.likedByMe}
            isOnline={interaction.isOnline}
            lastSeenAt={interaction.lastSeenAt}
            hasProfilePicture={CURRENT_USER_HAS_PROFILE_PICTURE}
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
        </div>
      </Container>
    </div>
  );
}
