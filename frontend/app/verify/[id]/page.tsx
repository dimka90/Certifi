import Layout from '../../components/Layout';
import { ShieldCheck, ExternalLink, Hash, Database, Clock, User, Landmark, Award } from 'lucide-react';

interface CertificatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CertificateVerification(props: CertificatePageProps) {
  const params = await props.params;
  return (
    <Layout>
      <div className="min-h-screen bg-black py-24 relative overflow-hidden">
        {/* Background glow Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-4">
              <ShieldCheck className="w-4 h-4" />
              Verified Authentic
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Certificate <span className="text-gradient-green">Verification</span>
            </h1>
            <p className="text-zinc-500 text-lg font-mono">
              ID: {params.id}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="w-64 h-64 text-green-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              {/* Details Column */}
              <div className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-green-500 rounded-full" />
                  <h2 className="text-2xl font-bold text-white">Credential Details</h2>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Certificate Title</label>
                      <p className="text-white text-lg font-semibold">Advanced AI Certification</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Issued To</label>
                      <p className="text-white text-lg font-semibold">John Doe</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Issued By</label>
                      <p className="text-white text-lg font-semibold">AI Institute of Technology</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Issue Date</label>
                      <p className="text-white text-lg font-semibold">January 15, 2025</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Proof Column */}
              <div className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-2xl font-bold text-white">Blockchain Reality</h2>
                </div>

                <div className="bg-zinc-950/50 rounded-2xl p-6 border border-white/5 space-y-6">
                  <div className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400 text-sm">Transaction</span>
                    </div>
                    <span className="text-green-500 font-mono text-sm hover:underline">0x1234...5678</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400 text-sm">Block Height</span>
                    </div>
                    <span className="text-white font-mono text-sm">1,234,567</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400 text-sm">Status</span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                      ACTIVE & VALID
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full h-14 bg-green-600 hover:bg-green-500 text-black font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-950/20 active:scale-[0.98]">
                    View on Explorer
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <p className="text-center text-zinc-600 text-xs mt-4">
                    Verification powered by immutable ledger technology
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
