"use client";

import TextField from "@/components/common/TextField";
import Typography from "@/components/common/Typography";
import DatePicker from "@/components/common/DatePicker";

interface IdentityStepProps {
  firstName: string;
  lastName: string;
  birthday: string;
  biography: string;
  onChange: (field: string, value: string) => void;
  showValidation?: boolean;
}

export default function IdentityStep({
  firstName,
  lastName,
  birthday,
  biography,
  onChange,
  showValidation = false,
}: IdentityStepProps) {
  // Calculate max date (18 years ago)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const maxDateString = maxDate.toISOString().split("T")[0];

  // Calculate min date (120 years ago)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  const minDateString = minDate.toISOString().split("T")[0];

  const hasFirstNameError = showValidation && !firstName.trim();
  const hasLastNameError = showValidation && !lastName.trim();
  const lastNameRegexError = showValidation && !lastName.trim().match(/^[a-zA-Z-']+$/);
  const firstNameRegexError = showValidation && !firstName.trim().match(/^[a-zA-Z-']+$/);
  const hasBirthdayError = showValidation && !birthday;
  const hasBiographyError =
    showValidation && (!biography.trim() || biography.trim().length < 50);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Prénom"
          value={firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          placeholder="Entrez votre prénom"
          required
          error={(firstNameRegexError ? "Le prénom contient des caractères invalides" : undefined) || (hasFirstNameError ? "Le prénom est requis" : undefined)}
        />
        <TextField
          label="Nom de famille"
          value={lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          placeholder="Entrez votre nom de famille"
          required
          error={(lastNameRegexError ? "Le nom de famille contient des caractères invalides" : undefined) || (hasLastNameError ? "Le nom de famille est requis" : undefined)}
        />
      </div>

      <DatePicker
        label="Date de naissance"
        value={birthday}
        onChange={(date) => onChange("birthday", date)}
        max={maxDateString}
        min={minDateString}
        required
        error={
          hasBirthdayError ? "La date de naissance est requise" : undefined
        }
        helperText={
          !hasBirthdayError ? "Vous devez avoir au moins 18 ans" : undefined
        }
      />

      <div>
        <label className="block mb-1">
          <Typography variant="small" bold>
            Biographie
          </Typography>
        </label>
        <textarea
          value={biography}
          onChange={(e) => onChange("biography", e.target.value)}
          placeholder="Parlez-nous de vous..."
          rows={6}
          className={`
						w-full px-4 py-3
						border rounded-md
						transition-all
						focus:outline-none focus:ring-2 focus:border-transparent
						resize-none
						${
              hasBiographyError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-pink-500"
            }
					`}
          required
        />
        <div className="mt-1 ml-1 flex justify-between items-start">
          <Typography
            variant="caption"
            color={hasBiographyError ? "error" : "secondary"}
          >
            {hasBiographyError
              ? biography.trim().length === 0
                ? "La biographie est requise"
                : `Minimum 50 caractères requis (${biography.trim().length}/50)`
              : "Minimum 50 caractères"}
          </Typography>
          <Typography variant="caption" color="secondary">
            {biography.trim().length} / 500
          </Typography>
        </div>
      </div>
    </div>
  );
}
