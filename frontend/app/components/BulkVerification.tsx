
import React, { useState } from 'react';
import { Upload, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const BulkVerification = () => {
    const [ids, setIds] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = () => {
        setIsVerifying(true);
        // Simulation
        setTimeout(() => setIsVerifying(false), 2000);
    };

    return (
        <Card className="bg-zinc-950/40 border-white/5 p-8 backdrop-blur-xl">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">Bulk Verification</h2>
                    <p className="text-zinc-400">Enter multiple certificate IDs separated by commas or new lines</p>
                </div>

                <textarea
                    value={ids}
                    onChange={(e) => setIds(e.target.value)}
                    placeholder="CERT-123, CERT-456, CERT-789"
                    className="w-full h-40 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all custom-scrollbar"
                />

                <div className="flex justify-center">
                    <Button
                        onClick={handleVerify}
                        disabled={!ids.trim() || isVerifying}
                        className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-all shadow-lg shadow-green-900/20 flex items-center space-x-2"
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                <span>Verify All</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
};
