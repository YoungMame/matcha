"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/common/Modal";
import Typography from "@/components/common/Typography";
import TextField from "@/components/common/TextField";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import { useRouter } from "next/navigation";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [step, setStep] = useState<"email" | "register" | "confirmation">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep("register");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== passwordConfirm) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    // Validate password requirements
    const passwordRegex =
      /^(?=.*?\d)(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[!@#$%^&*?\-])[\S]{10,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (!@#$%^&*?-)"
      );
      return;
    }

    // Clear error if passwords match
    setPasswordError("");

    try {
      // Prepare signup data with defaults for missing fields
      const signupData = {
        email,
        username,
        password,
        bornAt: "1990-01-01", // Default date of birth
        orientation: "bisexual" as const, // Default orientation
        gender: "men" as const, // Default gender
      };

      // const response = await fetch("/api/auth/signup", {
      // 	method: "POST",
      // 	headers: {
      // 		"Content-Type": "application/json",
      // 	},
      // 	body: JSON.stringify(signupData),
      // });

      //   console.log("Signup response:", response.body);

      //   if (!response.ok) {
      //     const errorData = await response.json();
      //     setPasswordError(
      //       errorData.error || "Une erreur est survenue lors de l'inscription"
      //     );
      //     return;
      //   }

      // Move to confirmation step on success
      setStep("confirmation");
    } catch (error) {
      console.error("Signup error:", error);
      setPasswordError("Erreur de connexion au serveur");
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setStep("email");
    setEmail("");
    setUsername("");
    setPassword("");
    setPasswordConfirm("");
    setPasswordError("");
    onClose();
  };

  const handleCreateProfile = () => {
    router.push("/onboarding");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <Image src="/Tinder.svg" alt="Matcha Logo" width={50} height={50} />
      </div>

      {/* Title */}
      <Typography variant="h2" align="center" className="mb-6">
        {step === "confirmation"
          ? "Vérifiez votre e-mail"
          : "Création de compte"}
      </Typography>

      {step === "email" ? (
        <form onSubmit={handleContinue}>
          {/* Terms text */}
          <Typography
            variant="small"
            color="secondary"
            align="center"
            className="mb-6"
          >
            En renseignant votre adresse e-mail vous acceptez nos{" "}
            <span className="underline">Conditions d'utilisation</span>.
            Consultez nos{" "}
            <span className="underline">politiques de confidentialité</span> et
            notre{" "}
            <span className="underline">politique relative aux cookies</span>.
          </Typography>

          {/* Email field */}
          <TextField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Adresse e-mail"
            required
            className="mb-6"
          />

          {/* Continue button */}
          <Button type="submit" variant="gradient" fullWidth>
            Continuer
          </Button>
        </form>
      ) : step === "register" ? (
        <form onSubmit={handleRegister}>
          {/* Info text */}
          <Typography
            variant="small"
            color="secondary"
            align="center"
            className="mb-6"
          >
            Vous pourrez vous connecter avec ce nom d'utilisateur.
          </Typography>

          {/* Registration fields */}
          <div className="space-y-4 mb-6">
            <TextField
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur"
              required
              minLength={6}
              helperText="Minimum 6 caractères"
            />
            <TextField
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Clear error when user starts typing
                if (passwordError) setPasswordError("");
              }}
              placeholder="Mot de passe"
              required
              minLength={10}
              helperText="Min. 10 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial"
            />
            <TextField
              type="password"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                // Clear error when user starts typing
                if (passwordError) setPasswordError("");
              }}
              placeholder="Confirmer le mot de passe"
              required
              minLength={10}
            />
          </div>

          {/* Password error message */}
          {passwordError && (
            <Alert variant="error" className="mb-4">
              {passwordError}
            </Alert>
          )}

          {/* Register button */}
          <Button type="submit" variant="gradient" fullWidth>
            S'inscrire
          </Button>
        </form>
      ) : (
        <div className="text-center">
          {/* Email icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-linear-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>

          {/* Confirmation message */}
          <Typography variant="body" align="center" className="mb-4">
            Inscription réussie !
          </Typography>
          <Typography
            variant="body"
            color="primary"
            align="center"
            className="font-semibold mb-6"
          >
            {email}
          </Typography>

          {/* Instructions */}
          <Typography
            variant="small"
            color="secondary"
            align="center"
            className="mb-6"
          >
            N'oubliez pas de vérifier votre e-mail pour activer votre compte et
            commencer à utiliser Matcha !
          </Typography>

          {/* Close button */}
          <Button onClick={handleCreateProfile} variant="primary" fullWidth>
            Créer mon profil
          </Button>

          {/* Resend email link */}
          <button
            type="button"
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 underline"
            onClick={() => {
              // Handle resend email logic here
              console.log("Resending email to:", email);
            }}
          >
            Renvoyer l'e-mail
          </button>
        </div>
      )}
    </Modal>
  );
}
