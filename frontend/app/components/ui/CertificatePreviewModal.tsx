
import React from 'react';
import { X, Download, Share2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    certificate: any;
}

export const CertificatePreviewModal: React.FC<PreviewModalProps> = ({
    isOpen,
    onClose,
    certificate
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <h3 className="text-xl font-bold text-white">Certificate Preview</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Certificate Mock View */}
                        <div className="aspect-[1.414/1] w-full bg-zinc-900 border-4 border-double border-zinc-800 rounded-lg p-12 flex flex-col items-center justify-between text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full" />

                            <div className="space-y-4">
                                <h4 className="text-green-500 font-serif text-lg tracking-widest uppercase">Certificate of Excellence</h4>
                                <div className="w-24 h-px bg-green-500/30 mx-auto" />
                            </div>

                            <div className="space-y-6">
                                <p className="text-zinc-400 italic">This is to certify that</p>
                                <h2 className="text-4xl font-bold text-white">{certificate?.studentName || 'Student Name'}</h2>
                                <p className="text-zinc-400 max-w-md">
                                    Has successfully completed the requirements for the degree of
                                </p>
                                <h4 className="text-2xl font-semibold text-zinc-200">{certificate?.degreeTitle || 'Degree Program'}</h4>
                            </div>

                            <div className="w-full flex justify-between items-end mt-12 border-t border-white/5 pt-8">
                                <div className="text-left">
                                    <p className="text-xs text-zinc-500 uppercase tracking-tighter">Issue Date</p>
                                    <p className="text-sm text-zinc-300">{new Date().toLocaleDateString()}</p>
                                </div>
                                <div className="text-center opacity-30">
                                    <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-2" />
                                    <p className="text-[10px] text-zinc-500">Official Seal</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500 uppercase tracking-tighter">Institution ID</p>
                                    <p className="text-sm text-zinc-300">CERT-2024-001</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-black/20 flex items-center justify-end space-x-4">
                        <button className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-colors">
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                        </button>
                        <button className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black font-bold transition-all shadow-lg shadow-green-900/20">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
