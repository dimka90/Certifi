import React from 'react';

const InstitutionTable = ({ institutions }: { institutions: any[] }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
      <table className="w-full text-left border-collapse">
        <thead className="bg-zinc-800/50 text-zinc-400 text-sm">
          <tr>
            <th className="p-4 font-medium">Institution Name</th>
            <th className="p-4 font-medium">Location</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {institutions.map((inst, idx) => (
            <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
              <td className="p-4 font-medium text-zinc-200">{inst.name}</td>
              <td className="p-4 text-zinc-400">{inst.country}</td>
              <td className="p-4">
                <span className={`px-2 py-0.5 rounded-full text-xs ${inst.isAuthorized ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {inst.isAuthorized ? 'Authorized' : 'Pending'}
                </span>
              </td>
              <td className="p-4 text-right">
                <button className="text-emerald-500 hover:text-emerald-400 text-sm font-medium">Manage</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstitutionTable;
