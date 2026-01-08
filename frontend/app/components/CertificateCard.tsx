import React from 'react';
import { Calendar, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  cert: any;
}

const CertificateCard = ({ cert }: Props) => {
  const isExpired = cert.expirationDate > 0 && Date.now() / 1000 > cert.expirationDate;

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-zinc-100">{cert.degreeTitle}</h3>
        {isExpired ? (
          <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs flex items-center gap-1">
            <AlertCircle size={14} /> Expired
          </span>
        ) : (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs flex items-center gap-1">
            <ShieldCheck size={14} /> Valid
          </span>
        )}
      </div>
      <div className="space-y-2 text-zinc-400 text-sm">
        <p>Issued to: <span className="text-zinc-200">{cert.studentName}</span></p>
        <div className="flex items-center gap-2 mt-4 text-xs">
          <Calendar size={14} />
          <span>Issued: {new Date(cert.issueDate * 1000).toLocaleDateString()}</span>
          {cert.expirationDate > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>Expires: {new Date(cert.expirationDate * 1000).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
