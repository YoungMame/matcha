"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/common/Modal";
import Typography from "@/components/common/Typography";
import TextField from "@/components/common/TextField";
import Button from "@/components/common/Button";
import Stack from "@/components/common/Stack";
import Alert from "@/components/common/Alert";
import { useLogin } from "@/hooks/useAuth";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
}

export default function SignInModal({
  isOpen,
  onClose,
  onSwitchToSignUp,
}: SignInModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const { login, isPending, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      // Close modal on successful login
      handleClose();
    } catch (err) {
      // Error is already set in the hook
      console.error("Login error:", err);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setFormData({ email: "", password: "" });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <Image src="/Tinder.svg" alt="Matcha Logo" width={50} height={50} />
      </div>

      {/* Title */}
      <Typography variant="h2" align="center" className="mb-6">
        Se connecter
      </Typography>

      {error && (
        <div className="mb-4">
          <Alert variant="error">
            {(error as any)?.response?.data?.error || error.message || "Login failed. Please try again."}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          <TextField
            label="Adresse e-mail"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Entrez votre adresse e-mail"
            required
          />

          <TextField
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Entrez votre mot de passe"
            required
          />

          <Button type="submit" variant="gradient" fullWidth disabled={isPending}>
            {isPending ? "Connexion..." : "Se connecter"}
          </Button>
        </Stack>
      </form>

      {/* Switch to sign up */}
      {onSwitchToSignUp && (
        <div className="mt-6 text-center">
          <Typography variant="small" color="secondary">
            Pas encore de compte ?{" "}
            <button
              onClick={onSwitchToSignUp}
              className="text-pink-500 hover:text-pink-600 font-medium"
            >
              S'inscrire
            </button>
          </Typography>
        </div>
      )}
    </Modal>
  );
}
