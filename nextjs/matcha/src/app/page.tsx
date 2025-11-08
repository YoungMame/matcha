"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/common/Button";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";
import SignUpModal from "@/components/homepage/SignUpModal";
import SignInModal from "@/components/homepage/SignInModal";
import AnimatedBackground from "@/components/homepage/AnimatedBackground";

export default function Home() {
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  return (
    <div className="font-sans h-full overflow-y-auto bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Hero Section with Animated Background */}
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Stack spacing="2xl" align="center">
            <Stack
              spacing="md"
              align="center"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-xl"
            >
              <Typography variant="h1" align="center">
                Bienvenue sur Matcha
              </Typography>
              <Typography
                variant="body"
                color="secondary"
                align="center"
                className="max-w-xl text-xl"
              >
                Trouvez votre match parfait
              </Typography>
            </Stack>

            <Stack direction="row" spacing="md" justify="center" wrap>
              <Button
                variant="gradient"
                onClick={() => setShowSignUpModal(true)}
              >
                S'inscrire
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowSignInModal(true)}
              >
                Se connecter
              </Button>
              <Link href="/browsing">
                <Button variant="secondary">Browsing (Protected)</Button>
              </Link>
            </Stack>
          </Stack>
        </div>
      </div>

      {/* Additional Content Section */}
      <div className="relative z-10 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Stack spacing="xl" align="center">
            <Typography variant="h2" align="center">
              Comment Matcha fonctionne ?
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
              <Stack
                spacing="md"
                align="center"
                className="p-6 rounded-xl bg-pink-50 dark:bg-gray-700"
              >
                <div className="text-5xl">👤</div>
                <Typography variant="h3" align="center">
                  Créez votre profil
                </Typography>
                <Typography color="secondary" align="center">
                  Partagez vos intérêts, photos et ce qui vous rend unique
                </Typography>
              </Stack>

              <Stack
                spacing="md"
                align="center"
                className="p-6 rounded-xl bg-purple-50 dark:bg-gray-700"
              >
                <div className="text-5xl">🔍</div>
                <Typography variant="h3" align="center">
                  Découvrez des Matchs
                </Typography>
                <Typography color="secondary" align="center">
                  Parcourez les profils qui correspondent à vos préférences et intérêts
                </Typography>
              </Stack>

              <Stack
                spacing="md"
                align="center"
                className="p-6 rounded-xl bg-blue-50 dark:bg-gray-700"
              >
                <div className="text-5xl">💬</div>
                <Typography variant="h3" align="center">
                  Commencez à discuter
                </Typography>
                <Typography color="secondary" align="center">
                  Connectez-vous avec vos matchs et commencez des conversations qui ont du sens
                </Typography>
              </Stack>
            </div>
          </Stack>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Stack spacing="xl">
            <Typography variant="h2" align="center">
              Pourquoi choisir Matcha ?
            </Typography>

            <Stack spacing="lg" className="mt-8">
              <div className="flex items-start gap-4 p-6 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="text-3xl">✨</div>
                <Stack spacing="sm">
                  <Typography variant="h3">Algorithme de Match Intelligent</Typography>
                  <Typography color="secondary">
                    Notre algorithme avancé prend en compte vos intérêts
                    et vos préférences pour trouver les correspondances les plus compatibles.
                  </Typography>
                </Stack>
              </div>

			  <div className="flex items-start gap-4 p-6 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="text-3xl">🎯</div>
                <Stack spacing="sm">
                  <Typography variant="h3">Experience Personnalisée</Typography>
                  <Typography color="secondary">
                    Personnalisez votre profil, définissez vos préférences et obtenez
                    des recommandations adaptées juste pour vous.
                  </Typography>
                </Stack>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="text-3xl">🔒</div>
                <Stack spacing="sm">
                  <Typography variant="h3">Sécurisé et Fiable</Typography>
                  <Typography color="secondary">
                    Votre vie privée et votre sécurité sont nos principales priorités. Tous
                    les profils sont vérifiés et vos mots de passe sont cryptées.
                  </Typography>
                </Stack>
              </div>

            </Stack>
          </Stack>
        </div>
      </div>

      <div className="relative z-10 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Stack spacing="lg" align="center">
            <Typography variant="h2" align="center">
              Prêt à trouver votre match ?
            </Typography>
            <Typography
              variant="body"
              color="secondary"
              align="center"
              className="max-w-2xl"
            >
              Rejoignez des milliers de personnes qui ont trouvé des connexions significatives sur
              Matcha. Votre match parfait n'est qu'à un clic.
            </Typography>
            <Button
              variant="gradient"
              size="large"
              onClick={() => setShowSignUpModal(true)}
            >
              S'inscrire Maintenant
            </Button>
          </Stack>
        </div>
      </div>

      {/* Modals */}
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
      />
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSwitchToSignUp={() => {
          setShowSignInModal(false);
          setShowSignUpModal(true);
        }}
      />
    </div>
  );
}
