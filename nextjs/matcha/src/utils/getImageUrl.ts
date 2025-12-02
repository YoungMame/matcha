/**
 * Convert a File object to a data URL for display
 */
export default function getImageUrl(file: File | null): string | null {
    return file ? URL.createObjectURL(file) : null;
}
