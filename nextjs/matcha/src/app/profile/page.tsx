"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/common/Container";
import Typography from "@/components/common/Typography";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import ProfileView from "@/components/profile/ProfileView";
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

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [interaction, setInteraction] = useState<ProfileInteraction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <Container className="py-8 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <Typography variant="h3" color="secondary">
            Chargement du profil...
          </Typography>
        </div>
      </Container>
    );
  }

  if (error || !profile || !interaction || !userId) {
    return (
      <Container className="py-8 h-full overflow-y-auto">
        <div className="space-y-4">
          <Alert variant="error">{error || "Profil non trouvé"}</Alert>
          <Button variant="primary" onClick={() => (window.location.href = "/browsing")}>
            Retour à la recherche
          </Button>
        </div>
      </Container>
    );
  }

  const connectionStatus = getConnectionStatus(userId);

  return (
    <Container className="py-8 h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/browsing")}
          className="mb-4"
        >
          ← Retour à la recherche
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
      </div>
    </Container>
  );
}
