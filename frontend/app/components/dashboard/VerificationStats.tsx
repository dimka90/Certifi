
import React from 'react';
import { CheckCircle, XCircle, Activity, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';

interface VerificationStatsProps {
    total: number;
    successful: number;
    failed: number;
    successRate: string;
}

export const VerificationStats: React.FC<VerificationStatsProps> = ({
    total,
    successful,
    failed,
    successRate
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-950/40 border-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between space-x-4">
                    <div>
                        <p className="text-zinc-400 text-sm font-medium">Total Verifications</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{total}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                        <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
            </Card>

            <Card className="bg-zinc-950/40 border-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between space-x-4">
                    <div>
                        <p className="text-zinc-400 text-sm font-medium">Successful</p>
                        <h3 className="text-2xl font-bold text-green-400 mt-1">{successful}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                </div>
            </Card>

            <Card className="bg-zinc-950/40 border-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between space-x-4">
                    <div>
                        <p className="text-zinc-400 text-sm font-medium">Failed/Revoked</p>
                        <h3 className="text-2xl font-bold text-red-400 mt-1">{failed}</h3>
                    </div>
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                        <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                </div>
            </Card>

            <Card className="bg-zinc-950/40 border-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between space-x-4">
                    <div>
                        <p className="text-zinc-400 text-sm font-medium">Success Rate</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{successRate}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                        <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                </div>
            </Card>
        </div>
    );
};
