export default function getImageUrl(file: File | null): string | null {
    return file ? URL.createObjectURL(file) : null;
};