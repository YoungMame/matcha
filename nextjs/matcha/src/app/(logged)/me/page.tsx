"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import Typography from "@/components/common/Typography";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import axiosInstance from "@/lib/axios";
import { MyProfile } from "@/types/myProfile";

export default function MyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Call the GET /private/user/me/profile endpoint
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
        const response = await axiosInstance.get(`${apiUrl}/private/user/me/profile`);
        
        setProfile(response.data);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        if (err.response?.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.");
          router.push("/login");
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("Erreur lors du chargement de votre profil");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProfile();
  }, [router]);

  const calculateAge = (bornAt: string): number => {
    const birthDate = new Date(bornAt);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Container size="xl" className="py-8">
          <div className="flex items-center justify-center h-64">
            <Typography variant="h3" color="secondary">
              Chargement de votre profil...
            </Typography>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Container size="xl" className="py-8">
          <div className="space-y-4 max-w-2xl mx-auto">
            <Alert variant="error">{error || "Profil non trouvé"}</Alert>
            <Button variant="primary" onClick={() => router.push("/browsing")}>
              Retour à la recherche
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <Container size="xl" className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Typography variant="h1" color="primary">
              Mon Profil
            </Typography>
            <Button variant="outline" onClick={() => router.push("/me/edit")}>
              Modifier
            </Button>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Profile Picture */}
            {profile.profilePictures && profile.profilePictures.length > 0 && (
              <div className="relative h-96 bg-gray-200 dark:bg-gray-700">
                <img
                  src={profile.profilePictures[profile.profilePictureIndex ?? 0] || profile.profilePictures[0]}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Profile Info */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <Typography variant="h2" color="primary" className="mb-2">
                  {profile.username}, {calculateAge(profile.bornAt)}
                </Typography>
                <Typography variant="body" color="secondary">
                  {profile.email}
                </Typography>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 flex-wrap">
                {profile.isVerified && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm">
                    ✓ Vérifié
                  </span>
                )}
                {profile.isProfileCompleted && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm">
                    ✓ Profil complet
                  </span>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <div>
                  <Typography variant="h3" color="primary" className="mb-2">
                    À propos
                  </Typography>
                  <Typography variant="body" color="secondary">
                    {profile.bio}
                  </Typography>
                </div>
              )}

              {/* Tags/Interests */}
              {profile.tags && profile.tags.length > 0 && (
                <div>
                  <Typography variant="h3" color="primary" className="mb-2">
                    Centres d'intérêt
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {profile.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gender & Orientation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h3" color="primary" className="mb-2">
                    Genre
                  </Typography>
                  <Typography variant="body" color="secondary">
                    {profile.gender === 'male' ? 'Homme' : 'Femme'}
                  </Typography>
                </div>
                <div>
                  <Typography variant="h3" color="primary" className="mb-2">
                    Orientation
                  </Typography>
                  <Typography variant="body" color="secondary">
                    {profile.orientation === 'heterosexual' && 'Hétérosexuel(le)'}
                    {profile.orientation === 'homosexual' && 'Homosexuel(le)'}
                    {profile.orientation === 'bisexual' && 'Bisexuel(le)'}
                  </Typography>
                </div>
              </div>

              {/* Location */}
              {(profile.location.city || profile.location.country) && (
                <div>
                  <Typography variant="h3" color="primary" className="mb-2">
                    Localisation
                  </Typography>
                  <Typography variant="body" color="secondary">
                    {profile.location.city && profile.location.country
                      ? `${profile.location.city}, ${profile.location.country}`
                      : profile.location.city || profile.location.country}
                  </Typography>
                </div>
              )}

              {/* Additional Photos */}
              {profile.profilePictures && profile.profilePictures.length > 1 && (
                <div>
                  <Typography variant="h3" color="primary" className="mb-3">
                    Photos ({profile.profilePictures.length})
                  </Typography>
                  <div className="grid grid-cols-3 gap-3">
                    {profile.profilePictures.map((pic, index) => (
                      <div
                        key={index}
                        className={`relative aspect-square rounded-lg overflow-hidden ${
                          index === profile.profilePictureIndex
                            ? 'ring-4 ring-pink-500'
                            : ''
                        }`}
                      >
                        <img
                          src={pic}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === profile.profilePictureIndex && (
                          <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Typography variant="small" color="secondary">
                  Membre depuis le {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
