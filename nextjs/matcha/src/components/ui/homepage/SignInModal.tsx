"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/common/Modal";
import Typography from "@/components/common/Typography";
import TextField from "@/components/common/TextField";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";

interface SignInModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
	const [step, setStep] = useState<"email" | "register" | "confirmation">("email");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [passwordError, setPasswordError] = useState("");

	const handleContinue = (e: React.FormEvent) => {
		e.preventDefault();
		if (email) {
			setStep("register");
		}
	};

	const handleRegister = (e: React.FormEvent) => {
		e.preventDefault();

		// Check if passwords match
		if (password !== passwordConfirm) {
			setPasswordError("Les mots de passe ne correspondent pas");
			return;
		}

		// Clear error if passwords match
		setPasswordError("");

		// Handle registration logic here
		console.log({ email, username, password, passwordConfirm });

		// Move to confirmation step
		setStep("confirmation");
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

	return (
		<Modal isOpen={isOpen} onClose={handleClose}>
			{/* Logo */}
			<div className="flex justify-center mb-4">
				<Image
					src="/Tinder.svg"
					alt="Matcha Logo"
					width={50}
					height={50}
				/>
			</div>

			{/* Title */}
			<Typography variant="h2" align="center" className="mb-6">
				{step === "confirmation" ? "Vérifiez votre e-mail" : "Création de compte"}
			</Typography>

			{step === "email" ? (
				<form onSubmit={handleContinue}>
					{/* Terms text */}
					<Typography variant="small" color="secondary" align="center" className="mb-6">
						En renseignant votre adresse e-mail vous acceptez nos{" "}
						<span className="underline">Conditions d'utilisation</span>.
						Consultez nos{" "}
						<span className="underline">politiques de confidentialité</span>{" "}
						et notre{" "}
						<span className="underline">
							politique relative aux cookies
						</span>
						.
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
					<Typography variant="small" color="secondary" align="center" className="mb-6">
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
							minLength={6}
							helperText="Minimum 6 caractères"
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
							minLength={6}
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
							<svg className="w-8 h-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
								<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
							</svg>
						</div>
					</div>

					{/* Confirmation message */}
					<Typography variant="body" align="center" className="mb-4">
						Un e-mail de confirmation a été envoyé à :
					</Typography>
					<Typography variant="body" color="primary" align="center" className="font-semibold mb-6">
						{email}
					</Typography>

					{/* Instructions */}
					<Typography variant="small" color="secondary" align="center" className="mb-6">
						Veuillez cliquer sur le lien dans l'e-mail pour activer votre compte.
						Si vous ne voyez pas l'e-mail, vérifiez votre dossier spam.
					</Typography>

					{/* Close button */}
					<Button onClick={handleClose} variant="primary" fullWidth>
						Compris
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