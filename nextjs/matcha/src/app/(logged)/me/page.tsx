"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Container from "@/components/common/Container";
import Typography from "@/components/common/Typography";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import TextField from "@/components/common/TextField";
import { useMyProfile } from "@/hooks/useProfile";
import { profileApi } from "@/lib/api/profile";
import InterestsStep from "@/components/onboarding/steps/InterestsStep";

export default function MyProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error } = useMyProfile();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingMain, setIsSettingMain] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    tags: [] as string[],
    gender: "",
    orientation: "",
    bornAt: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        bio: profile.bio || "",
        tags: profile.tags || [],
        gender: profile.gender || "",
        orientation: profile.orientation || "",
        bornAt: profile.bornAt ? new Date(profile.bornAt).toISOString().split('T')[0] : "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    setValidationError(null);
    
    if (formData.tags.length < 3) {
      setValidationError("Vous devez sélectionner au moins 3 centres d'intérêt.");
      return;
    }

    if (formData.bio.trim().length < 50) {
      setValidationError("Votre bio doit contenir au moins 50 caractères.");
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setValidationError("Veuillez remplir tous les champs obligatoires (Prénom, Nom, Email).");
      return;
    }

    const updateData = async () => {
      setIsUpdating(true);
      try {
        await profileApi.updateProfile({
          ...formData,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          bio: formData.bio.trim(),
          gender: formData.gender as "men" | "women",
          orientation: formData.orientation as "heterosexual" | "homosexual" | "bisexual" | "other",
          bornAt: formData.bornAt ? new Date(formData.bornAt).toISOString() : undefined,
        });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['user'] });
        setIsEditing(false);
      } catch (err) {
        console.error(err);
        setValidationError("Erreur lors de la mise à jour du profil");
      } finally {
        setIsUpdating(false);
      }
    };

    updateData();
  };

  const handleUploadPicture = async (file: File) => {
    setIsUploading(true);
    try {
      await profileApi.uploadProfilePicture(file);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      console.error(err);
      setValidationError("Erreur lors de l'upload de la photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePicture = async (index: number) => {
    setIsDeleting(true);
    try {
      await profileApi.deleteProfilePicture(index);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      console.error(err);
      setValidationError("Erreur lors de la suppression de la photo");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetMainPicture = async (index: number) => {
    setIsSettingMain(true);
    try {
      await profileApi.setProfilePictureIndex(index);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      console.error(err);
      setValidationError("Erreur lors de la définition de la photo principale");
    } finally {
      setIsSettingMain(false);
    }
  };

  const handleCancel = () => {
    setValidationError(null);
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        bio: profile.bio || "",
        tags: profile.tags || [],
        gender: profile.gender || "",
        orientation: profile.orientation || "",
        bornAt: profile.bornAt ? new Date(profile.bornAt).toISOString().split('T')[0] : "",
      });
    }
    setIsEditing(false);
  };

  const calculateAge = (bornAt: string): number => {
    if (!bornAt) return 0;
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
        <Container size="full" className="py-8">
          <div className="flex items-center justify-center h-64">
            <Typography variant="h3" color="secondary">
              Chargement de votre profil...
            </Typography>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.response?.data?.error || error.message || "Erreur lors du chargement de votre profil";
    const is401 = (error as any)?.response?.status === 401;
    
    if (is401) {
      router.push("/");
    }
    
    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Container size="full" className="py-8">
          <div className="space-y-4 w-full px-4">
            <Alert variant="error">{errorMessage}</Alert>
            <Button variant="primary" onClick={() => router.push("/browsing")}>
              Retour à la recherche
            </Button>
          </div>
        </Container>
      </div>
    );
  }
  
  if (!profile) {
    return null;
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <Container size="full" className="py-8">
        <div className="w-full mx-auto space-y-6 px-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Typography variant="h1" color="primary">
              Mon Profil
            </Typography>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
                    Annuler
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={isUpdating}>
                    {isUpdating ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
              )}
            </div>
          </div>

          {validationError && (
            <Alert variant="error">{validationError}</Alert>
          )}

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
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <TextField
                        label="Prénom"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                      <TextField
                        label="Nom"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                    <TextField
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <TextField
                      label="Date de naissance"
                      type="date"
                      value={formData.bornAt}
                      onChange={(e) => setFormData({ ...formData, bornAt: e.target.value })}
                    />
                  </div>
                ) : (
                  <>
                    <Typography variant="h2" color="primary" className="mb-2">
                      {profile.firstName} {profile.lastName}, {calculateAge(profile.bornAt)}
                    </Typography>
                    <Typography variant="body" color="secondary">
                      @{profile.username}
                    </Typography>
                    <Typography variant="body" color="secondary">
                      {profile.email}
                    </Typography>
                  </>
                )}
              </div>

              {/* Status Badges */}
              {!isEditing && (
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
              )}

              {/* Bio */}
              <div>
                <Typography variant="h3" color="primary" className="mb-2">
                  À propos
                </Typography>
                {isEditing ? (
                  <textarea
                    className="w-full px-4 py-3 border rounded-md transition-all focus:outline-none focus:ring-2 focus:border-transparent border-gray-300 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                ) : (
                  <Typography variant="body" color="secondary">
                    {profile.bio || "Aucune description"}
                  </Typography>
                )}
              </div>

              {/* Tags/Interests */}
              <div>
                <Typography variant="h3" color="primary" className="mb-2">
                  Centres d'intérêt
                </Typography>
                {isEditing ? (
                  <InterestsStep
                    interests={formData.tags}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.tags && profile.tags.length > 0 ? (
                      profile.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <Typography variant="body" color="secondary">Aucun centre d'intérêt</Typography>
                    )}
                  </div>
                )}
              </div>

              {/* Gender & Orientation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="h3" color="primary" className="mb-2">
                    Genre
                  </Typography>
                  {isEditing ? (
                    <select
                      className="w-full px-4 py-3 border rounded-md transition-all focus:outline-none focus:ring-2 focus:border-transparent border-gray-300 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="men">Homme</option>
                      <option value="women">Femme</option>
                    </select>
                  ) : (
                    <Typography variant="body" color="secondary">
                      {profile.gender === 'men' ? 'Homme' : 'Femme'}
                    </Typography>
                  )}
                </div>
                <div>
                  <Typography variant="h3" color="primary" className="mb-2">
                    Orientation
                  </Typography>
                  {isEditing ? (
                    <select
                      className="w-full px-4 py-3 border rounded-md transition-all focus:outline-none focus:ring-2 focus:border-transparent border-gray-300 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600"
                      value={formData.orientation}
                      onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                    >
                      <option value="heterosexual">Hétérosexuel(le)</option>
                      <option value="homosexual">Homosexuel(le)</option>
                      <option value="bisexual">Bisexuel(le)</option>
                      <option value="other">Autre</option>
                    </select>
                  ) : (
                    <Typography variant="body" color="secondary">
                      {profile.orientation === 'heterosexual' && 'Hétérosexuel(le)'}
                      {profile.orientation === 'homosexual' && 'Homosexuel(le)'}
                      {profile.orientation === 'bisexual' && 'Bisexuel(le)'}
                      {profile.orientation === 'other' && 'Autre'}
                    </Typography>
                  )}
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

              {/* Photos Management */}
              {(isEditing || (profile.profilePictures && profile.profilePictures.length > 0)) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="h3" color="primary">
                      Photos ({profile.profilePictures?.length || 0})
                    </Typography>
                    {isEditing && (profile.profilePictures?.length || 0) < 5 && (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                setValidationError("L'image ne doit pas dépasser 5MB");
                                return;
                              }
                              handleUploadPicture(file);
                            }
                          }}
                          disabled={isUploading}
                        />
                        <span className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-sm font-medium inline-block">
                          {isUploading ? "Ajout..." : "Ajouter une photo"}
                        </span>
                      </label>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.profilePictures?.map((pic: string, index: number) => (
                      <div
                        key={index}
                        className={`relative aspect-square rounded-lg overflow-hidden group ${
                          index === profile.profilePictureIndex
                            ? 'ring-4 ring-pink-500'
                            : 'border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <img
                          src={pic}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Main Photo Indicator */}
                        {index === profile.profilePictureIndex && (
                          <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1 shadow-md z-10">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        )}

                        {/* Edit Controls */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            {index !== profile.profilePictureIndex && (
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => handleSetMainPicture(index)}
                                disabled={isSettingMain}
                                className="w-full text-xs"
                              >
                                Définir principale
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleDeletePicture(index)}
                              disabled={isDeleting}
                              className="w-full text-xs bg-white text-red-500 border-red-500 hover:bg-red-50"
                            >
                              Supprimer
                            </Button>
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
