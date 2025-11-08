import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export default function LocationPermissionModal({
  isOpen,
  onAllow,
  onDeny,
}: LocationPermissionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onDeny}>
      <Stack spacing="lg">
        <Typography variant="h2" align="center">
          Location Permission
        </Typography>

        <div className="flex justify-center">
          <svg
            className="h-16 w-16 text-indigo-600 dark:text-indigo-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <Typography color="secondary" align="center">
          We would like to use your location to help you find better matches
          nearby. Your location data will be stored securely.
        </Typography>

        <Stack spacing="md">
          <Button variant="gradient" onClick={onAllow} fullWidth>
            Allow Location Access
          </Button>
          <Button variant="secondary" onClick={onDeny} fullWidth>
            Not Now
          </Button>
        </Stack>

        <Typography variant="small" color="secondary" align="center">
          You can change this setting at any time in your browser settings.
        </Typography>
      </Stack>
    </Modal>
  );
}
