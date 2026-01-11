
import { useState, useEffect } from 'react';

export const useCertificate = (certificateId: string) => {
    const [certificate, setCertificate] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!certificateId) return;

        const fetchCertificate = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Simulation of contract call
                await new Promise(resolve => setTimeout(resolve, 1000));
                setCertificate({
                    id: certificateId,
                    studentName: 'Temitope Adekunle',
                    degreeTitle: 'B.Sc. Computer Science',
                    issueDate: Date.now(),
                    isValid: true,
                    institution: 'Lagos State University'
                });
            } catch (err) {
                setError('Failed to fetch certificate details');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCertificate();
    }, [certificateId]);

    return { certificate, isLoading, error };
};
