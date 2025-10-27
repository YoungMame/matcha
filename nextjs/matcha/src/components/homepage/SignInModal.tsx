"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Modal from "@/components/common/Modal";
import Typography from "@/components/common/Typography";
import TextField from "@/components/common/TextField";
import Button from "@/components/common/Button";
import Stack from "@/components/common/Stack";
import Alert from "@/components/common/Alert";

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
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/api/auth/login", formData);
      handleClose();
      router.push("/app");
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setFormData({ username: "", password: "" });
    setError("");
    setLoading(false);
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
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          <TextField
            label="Nom d'utilisateur"
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="Entrez votre nom d'utilisateur"
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

          <Button type="submit" variant="gradient" fullWidth disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </Stack>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
        <Typography
          variant="small"
          color="secondary"
          className="mb-2 font-medium"
        >
          Identifiants de test :
        </Typography>
        <Stack spacing="sm">
          <Typography variant="small" color="secondary">
            <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              admin / admin123
            </code>
          </Typography>
          <Typography variant="small" color="secondary">
            <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              user / user123
            </code>
          </Typography>
        </Stack>
      </div>

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
