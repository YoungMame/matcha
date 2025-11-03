"use client";

import { useState } from "react";
import IconButton from "@/components/common/IconButton";
import Modal from "@/components/common/Modal";
import Typography from "@/components/common/Typography";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";

interface ProfileActionsProps {
  userId: string;
  isLiked: boolean;
  isConnected: boolean;
  hasProfilePicture: boolean;
  onToggleLike: () => Promise<void>;
  onBlock: () => Promise<void>;
  onReport: () => Promise<void>;
}

export default function ProfileActions({
  userId,
  isLiked,
  isConnected,
  hasProfilePicture,
  onToggleLike,
  onBlock,
  onReport,
}: ProfileActionsProps) {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
    setIsLoading(true);
    try {
      await onToggleLike();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = async () => {
    setIsLoading(true);
    try {
      await onBlock();
      setShowBlockModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = async () => {
    setIsLoading(true);
    try {
      await onReport();
      setShowReportModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-4">
        {/* Like Button */}
        <div className="flex flex-col items-center gap-2">
          <IconButton
            variant={isLiked ? "error" : "primary"}
            size="large"
            onClick={handleToggleLike}
            disabled={!hasProfilePicture || isLoading}
            title={
              !hasProfilePicture
                ? "Vous devez avoir une photo de profil pour liker"
                : isLiked
                ? "Retirer le like"
                : "Liker"
            }
          >
            {isLiked ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="w-8 h-8"
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
          </IconButton>
          <Typography variant="small" color="secondary">
            {isLiked ? (isConnected ? "Connectés" : "Liké") : "Liker"}
          </Typography>
        </div>

        {/* Report Button */}
        <div className="flex flex-col items-center gap-2">
          <IconButton
            variant="secondary"
            size="medium"
            onClick={() => setShowReportModal(true)}
            disabled={isLoading}
            title="Signaler comme faux compte"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
          </IconButton>
          <Typography variant="small" color="secondary">
            Signaler
          </Typography>
        </div>

        {/* Block Button */}
        <div className="flex flex-col items-center gap-2">
          <IconButton
            variant="error"
            size="medium"
            onClick={() => setShowBlockModal(true)}
            disabled={isLoading}
            title="Bloquer cet utilisateur"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </IconButton>
          <Typography variant="small" color="secondary">
            Bloquer
          </Typography>
        </div>
      </div>

      {!hasProfilePicture && (
        <Alert variant="warning" className="mt-4">
          Vous devez ajouter une photo de profil pour pouvoir liker d&apos;autres profils.
        </Alert>
      )}

      {/* Block Confirmation Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <Typography variant="h3" color="primary">
            Bloquer cet utilisateur ?
          </Typography>
          <Typography variant="body" color="secondary">
            En bloquant cet utilisateur :
          </Typography>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <Typography variant="small" color="secondary">
              <li>Il n&apos;apparaîtra plus dans vos résultats de recherche</li>
              <li>Vous ne recevrez plus de notifications de sa part</li>
              <li>La conversation sera désactivée</li>
              <li>Vos likes mutuels seront supprimés</li>
            </Typography>
          </ul>
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowBlockModal(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button variant="primary" fullWidth onClick={handleBlock} disabled={isLoading}>
              {isLoading ? "Blocage..." : "Confirmer"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Confirmation Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <Typography variant="h3" color="primary">
            Signaler comme faux compte ?
          </Typography>
          <Typography variant="body" color="secondary">
            Vous êtes sur le point de signaler cet utilisateur comme faux compte. Notre équipe
            examinera ce profil et prendra les mesures appropriées si nécessaire.
          </Typography>
          <Alert variant="info">
            Les signalements abusifs peuvent entraîner des sanctions sur votre compte.
          </Alert>
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowReportModal(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button variant="primary" fullWidth onClick={handleReport} disabled={isLoading}>
              {isLoading ? "Signalement..." : "Confirmer"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
