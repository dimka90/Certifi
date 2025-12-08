import Layout from '../../components/Layout';

interface CertificatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CertificateVerification(props: CertificatePageProps) {
  const params = await props.params;
  return (
    <Layout>
      <div className="min-h-screen bg-black py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Certificate Verification
            </h1>
            <p className="text-gray-400 text-lg">
              Certificate ID: {params.id}
            </p>
          </div>

          <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 backdrop-blur-sm rounded-2xl p-8 border border-zinc-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Certificate Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Certificate Title</label>
                    <p className="text-white font-medium">Advanced AI Certification</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Issued To</label>
                    <p className="text-white font-medium">John Doe</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Issued By</label>
                    <p className="text-white font-medium">AI Institute</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Issue Date</label>
                    <p className="text-white font-medium">January 15, 2025</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Status</label>
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      Valid
                    </span>
                  </div>
                </div>
              </div>

              {/* Blockchain Proof */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Blockchain Proof</h2>
                <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/50">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transaction Hash:</span>
                      <span className="text-green-400 font-mono text-sm">0x1234...5678</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Block Number:</span>
                      <span className="text-white">1,234,567</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-white">Base</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Verification:</span>
                      <span className="text-green-400">✓ Verified</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-black font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300">
                    View on Blockchain Explorer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
