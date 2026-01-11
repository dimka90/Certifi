
export const qrGenerator = {
    generateVerificationUrl: (certificateId: string): string => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://certifi.base';
        return `${baseUrl}/verify/${certificateId}`;
    },

    getQrCodeUrl: (certificateId: string, size = 200): string => {
        const url = qrGenerator.generateVerificationUrl(certificateId);
        // Using a public QR code API for demonstration
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
    }
};
