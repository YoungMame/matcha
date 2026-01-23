"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import Typography from "@/components/common/Typography";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import { useUserProfile } from "@/hooks/useUserProfile";
import { userProfileApi } from "@/lib/api/userProfile";
import { useBrowsing as useBrowsingContext } from "@/contexts/BrowsingContext";
import { differenceInYears } from "date-fns";
import Badge from "@/components/common/Badge";
import ImageViewerModal from "@/components/common/ImageViewerModal";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // Fetch profile data
  const { data: profileData, isLoading, error, refetch } = useUserProfile(userId || "");

  // Record visit when profile loads
//   useEffect(() => {
//     if (userId && profileData) recordVisit(userId);
//   }, [userId, profileData, recordVisit]);

  // Derived display helpers
  const age = profileData?.bornAt ? differenceInYears(new Date(), new Date(profileData.bornAt)) : undefined;
  // const isLikedByMe = profileData?.isLikedByMe ?? false; // Not available in backend response yet
  const isLikedByMe = false; 
  
  const mainProfilePicture = profileData?.profilePictures && profileData.profilePictures.length > 0
    ? (profileData.profilePictures[profileData.profilePictureIndex] || profileData.profilePictures[0])
    : null;
    
  const hasProfilePicture = !!mainProfilePicture;
  
  const interestedInComputed: string[] = (() => {
    if (!profileData) return [];
    // Basic mapping of orientation to genders based on user's gender
    const selfGender = profileData.gender; // 'men' | 'women' | 'male' | 'female'
    
    // Normalize gender for logic
    const normalizedGender = (selfGender === 'men' || selfGender === 'male') ? 'male' : 'female';
    
    switch (profileData.orientation) {
      case 'heterosexual':
        return [normalizedGender === 'male' ? 'female' : 'male'];
      case 'homosexual':
        return [normalizedGender];
      case 'bisexual':
        return ['male', 'female'];
      default:
        return [];
    }
  })();

  const handleToggleLike = async () => {
    if (!userId) return;
    
    setIsLiking(true);
    try {
      const data = await userProfileApi.likeProfile({ userId });
      
      if (data.matched) {
        setSuccessMessage("🎉 Félicitations ! Vous êtes maintenant connectés. Vous pouvez commencer à discuter !");
      } else {
        setSuccessMessage("❤️ Like envoyé !");
      }
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Refetch profile to update like status
      refetch();
    } catch (error) {
      setSuccessMessage("Erreur lors du like");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBlock = async () => {
    if (!userId) return;
    
    setIsBlocking(true);
    try {
      await userProfileApi.blockProfile({ userId });
      
      setSuccessMessage("✅ Utilisateur bloqué. Il n'apparaîtra plus dans vos recherches.");
      setTimeout(() => {
        router.push("/browsing");
      }, 2000);
    } catch (error) {
      setSuccessMessage("Erreur lors du blocage");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleReport = async () => {
    if (!userId) return;
    
    setIsReporting(true);
    try {
      await userProfileApi.reportProfile({ userId });
      
      setSuccessMessage("✅ Signalement envoyé. Notre équipe examinera ce profil.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setSuccessMessage("Erreur lors du signalement");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsReporting(false);
    }
  };

  const handleOpenImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImageIndex(0);
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

  if (error || !profileData) {
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
      <Container size="full" className="py-8">
        <div className="w-full mx-auto space-y-6 px-4">
          {successMessage && (
            <Alert variant="success" className="animate-fade-in">
              {successMessage}
            </Alert>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h1" color="primary">
                {profileData.username}{age !== undefined ? `, ${age}` : ""}
              </Typography>
              {/* <Typography variant="body" color="secondary">@{profileData.username}</Typography> */}
            </div>
            <div className="flex gap-2">
              <Button variant={isLikedByMe ? "gradient" : "primary"} disabled={isLiking || !hasProfilePicture} onClick={handleToggleLike}>
                {isLiking ? "..." : isLikedByMe ? "Unlike" : "Like"}
              </Button>
              <Button variant="outline" disabled={isBlocking} onClick={handleBlock}>{isBlocking ? "Blocage..." : "Bloquer"}</Button>
              <Button variant="outline" disabled={isReporting} onClick={handleReport}>{isReporting ? "Signalement..." : "Signaler"}</Button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap">
            {/* isOnline and fame are not available in backend response yet */}
            {/* {profileData.isOnline && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm">En ligne</span>
            )} */}
            {/* {profileData.fame > 0 && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-full text-sm">Fame {profileData.fame}</span>
            )} */}
          </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Profile Picture */}
              {mainProfilePicture && (
                <div 
                  className="relative h-96 bg-gray-200 dark:bg-gray-700 cursor-pointer"
                  onClick={() => handleOpenImageModal(profileData.profilePictureIndex || 0)}
                >
                  <img
                    src={mainProfilePicture}
                    alt={profileData.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 space-y-6">
                {/* About */}
                <div>
                  <Typography variant="h3" color="primary" className="mb-2">À propos</Typography>
                  <Typography variant="body" color="secondary" className="leading-relaxed">
                    {profileData.bio || "Aucune biographie renseignée"}
                  </Typography>
                </div>

                {/* Interests */}
                <div>
                  <Typography variant="h3" color="primary" className="mb-2">Centres d'intérêt</Typography>
                  {profileData.tags && profileData.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.tags.map((tag, i) => (
                        <Badge key={i} variant="primary" size="medium" className="px-3 py-1.5">{tag}</Badge>
                      ))}
                    </div>
                  ) : (
                    <Typography variant="small" color="secondary" className="italic">Aucun centre d'intérêt</Typography>
                  )}
                </div>

                {/* Gender & Orientation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Typography variant="h3" color="primary" className="text-lg">Genre</Typography>
                    <Typography variant="body" color="secondary">
                      {(profileData.gender === 'male' || profileData.gender === 'men') ? 'Homme' : (profileData.gender === 'female' || profileData.gender === 'women') ? 'Femme' : 'Autre'}
                    </Typography>
                  </div>
                  <div className="space-y-1">
                    <Typography variant="h3" color="primary" className="text-lg">Orientation</Typography>
                    <Typography variant="body" color="secondary">
                      {profileData.orientation === 'heterosexual' ? 'Hétérosexuel' : profileData.orientation === 'homosexual' ? 'Homosexuel' : profileData.orientation === 'bisexual' ? 'Bisexuel' : 'Autre'}
                    </Typography>
                  </div>
                </div>

                {/* Interested In */}
                {interestedInComputed.length > 0 && (
                  <div>
                    <Typography variant="h3" color="primary" className="mb-2">Intéressé par</Typography>
                    <Typography variant="body" color="secondary">
                      {interestedInComputed.map((g, idx) => (
                        <span key={g}>{g === 'male' ? 'Hommes' : g === 'female' ? 'Femmes' : 'Autres'}{idx < interestedInComputed.length - 1 && ', '}</span>
                      ))}
                    </Typography>
                  </div>
                )}

                {/* Location */}
                {(profileData.location?.city || profileData.location?.country) && (
                  <div>
                    <Typography variant="h3" color="primary" className="mb-2">Localisation</Typography>
                    <Typography variant="body" color="secondary">
                      {profileData.location.city ? profileData.location.city : ''}
                      {profileData.location.city && profileData.location.country ? ', ' : ''}
                      {profileData.location.country ? profileData.location.country : ''}
                    </Typography>
                  </div>
                )}

                {/* Additional Pictures */}
                {profileData.profilePictures && profileData.profilePictures.length > 1 && (
                  <div>
                    <Typography variant="h3" color="primary" className="mb-2">Photos</Typography>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {profileData.profilePictures.map((p, i) => {
                        // Show all pictures
                        return (
                          <div 
                            key={i} 
                            className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded overflow-hidden cursor-pointer"
                            onClick={() => handleOpenImageModal(i)}
                          >
                            <img src={p} alt={`photo-${i}`} className="w-full h-full object-cover" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </Container>

      <ImageViewerModal
        isOpen={isImageModalOpen}
        onClose={handleCloseImageModal}
        images={profileData.profilePictures || []}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
        title={`${profileData.username}${age !== undefined ? `, ${age}` : ""}`}
      />
    </div>
  );
}
