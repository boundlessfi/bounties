// Requirements and Scope cards are kept as generic components
// but no longer tied to the Bounty type since the backend
// doesn't include requirements/scope on the Bounty model.

export function RequirementsCard({ requirements }: { requirements: string[] }) {
  if (requirements.length === 0) return null;

  return (
    <div className="p-6 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
        Requirements
      </h2>
      <ul className="space-y-2.5">
        {requirements.map((req, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
            <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
            {req}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScopeCard({ scope }: { scope: string }) {
  return (
    <div className="p-6 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
        Scope
      </h2>
      <p className="text-sm text-gray-300 leading-relaxed">{scope}</p>
    </div>
  );
}
