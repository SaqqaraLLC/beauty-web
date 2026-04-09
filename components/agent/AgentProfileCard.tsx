import Link from 'next/link';
import StarRating from '@/components/reviews/StarRating';
import type { AgentProfile } from '@/lib/types';

interface Props {
  agent: AgentProfile;
}

export default function AgentProfileCard({ agent }: Props) {
  return (
    <div className="card space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
          <span className="text-sm font-cinzel text-saqqara-gold">{agent.fullName.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light truncate">{agent.fullName}</p>
          {agent.agencyName && (
            <p className="text-saqqara-gold/60 text-xs truncate">{agent.agencyName}</p>
          )}
        </div>
        {agent.isVerified && (
          <span className="text-saqqara-gold text-xs" title="Verified Agent">✦</span>
        )}
      </div>

      {/* Specialties */}
      {agent.specialties && agent.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {agent.specialties.slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-[0.6rem] font-cinzel tracking-[0.06em] text-saqqara-light/40"
              style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
              {s}
            </span>
          ))}
          {agent.specialties.length > 3 && (
            <span className="text-[0.6rem] text-saqqara-light/25 self-center">+{agent.specialties.length - 3} more</span>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-between pt-1"
        style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-1.5">
          {agent.averageRating !== undefined && agent.averageRating > 0 && (
            <>
              <StarRating value={agent.averageRating} size={10} />
              <span className="text-saqqara-light/30 text-[0.6rem] font-cinzel">
                {agent.averageRating.toFixed(1)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {agent.rosterCount !== undefined && (
            <span className="text-saqqara-light/30 text-[0.6rem] font-cinzel">
              {agent.rosterCount} artist{agent.rosterCount !== 1 ? 's' : ''}
            </span>
          )}
          <Link href={`/agents/${agent.agentId}`} className="btn btn-ghost" style={{ padding: '0.25rem 0.75rem', fontSize: '0.65rem' }}>
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
