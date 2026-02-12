import React from 'react';

/**
 * Inline SVG of a simplified human body (front view) with muscle groups.
 * Pass `highlighted` as a muscle group string (e.g., "Peito", "Costas", "Pernas")
 * and the matching region lights up in red/orange.
 */

const MUSCLE_MAP = {
  // Map grupo_muscular ➜ SVG region IDs
  'Peito': ['chest'],
  'Costas': ['back-upper', 'back-lower'],
  'Ombros': ['shoulder-left', 'shoulder-right'],
  'Bíceps': ['bicep-left', 'bicep-right'],
  'Tríceps': ['tricep-left', 'tricep-right'],
  'Pernas': ['quad-left', 'quad-right', 'hamstring-left', 'hamstring-right'],
  'Quadríceps': ['quad-left', 'quad-right'],
  'Isquiotibiais': ['hamstring-left', 'hamstring-right'],
  'Glúteos': ['glute-left', 'glute-right'],
  'Abdômen': ['abs'],
  'Panturrilha': ['calf-left', 'calf-right'],
  'Antebraço': ['forearm-left', 'forearm-right'],
  'Trapézio': ['trap'],
  'Cardio': ['chest', 'quad-left', 'quad-right', 'calf-left', 'calf-right'],
  'Full Body': ['chest', 'abs', 'quad-left', 'quad-right', 'shoulder-left', 'shoulder-right', 'bicep-left', 'bicep-right'],
  'Posterior': ['hamstring-left', 'hamstring-right', 'glute-left', 'glute-right', 'back-lower'],
};

// Normalise common variants
const normalise = (g) => {
  if (!g) return '';
  const s = g.trim();
  const map = {
    'peito': 'Peito', 'chest': 'Peito',
    'costas': 'Costas', 'back': 'Costas',
    'ombros': 'Ombros', 'shoulders': 'Ombros', 'deltóides': 'Ombros',
    'bíceps': 'Bíceps', 'biceps': 'Bíceps',
    'tríceps': 'Tríceps', 'triceps': 'Tríceps',
    'pernas': 'Pernas', 'legs': 'Pernas', 'quadríceps': 'Pernas',
    'glúteos': 'Glúteos', 'gluteos': 'Glúteos', 'glutes': 'Glúteos',
    'abdômen': 'Abdômen', 'abdomen': 'Abdômen', 'abs': 'Abdômen', 'abdômen': 'Abdômen',
    'panturrilha': 'Panturrilha', 'calves': 'Panturrilha',
    'antebraço': 'Antebraço', 'forearm': 'Antebraço',
    'trapézio': 'Trapézio', 'trapezio': 'Trapézio',
    'cardio': 'Cardio',
    'full body': 'Full Body',
    'posterior': 'Posterior',
  };
  return map[s.toLowerCase()] || s;
};

export const MuscleMap = ({ grupo, size = 100, className = '' }) => {
  const group = normalise(grupo);
  const activeRegions = MUSCLE_MAP[group] || [];
  const isActive = (id) => activeRegions.includes(id);

  const base = 'rgba(148,163,184,0.15)';     // default muscle color
  const hot  = '#ef4444';                      // highlighted color (red)
  const hotGlow = 'rgba(239,68,68,0.35)';     // glow

  const fill = (id) => isActive(id) ? hot : base;
  const opacity = (id) => isActive(id) ? 1 : 0.6;

  return (
    <svg
      viewBox="0 0 200 380"
      width={size}
      className={className}
      style={{ filter: activeRegions.length ? 'drop-shadow(0 0 8px rgba(239,68,68,0.25))' : 'none' }}
    >
      {/* === HEAD === */}
      <ellipse cx="100" cy="30" rx="20" ry="24" fill="rgba(148,163,184,0.2)" stroke="rgba(148,163,184,0.3)" strokeWidth="1.2" />

      {/* === NECK === */}
      <rect x="92" y="52" width="16" height="14" rx="4" fill="rgba(148,163,184,0.18)" />

      {/* === TRAPEZIUS === */}
      <path id="trap" d="M76 66 L92 62 L100 66 L108 62 L124 66 L120 78 L80 78 Z" 
        fill={fill('trap')} opacity={opacity('trap')} />

      {/* === SHOULDERS === */}
      <ellipse id="shoulder-left" cx="68" cy="82" rx="14" ry="12"
        fill={fill('shoulder-left')} opacity={opacity('shoulder-left')} />
      <ellipse id="shoulder-right" cx="132" cy="82" rx="14" ry="12"
        fill={fill('shoulder-right')} opacity={opacity('shoulder-right')} />

      {/* === CHEST === */}
      <path id="chest" d="M78 78 Q100 72 122 78 L120 108 Q100 114 80 108 Z"
        fill={fill('chest')} opacity={opacity('chest')} rx="4" />

      {/* === BICEPS === */}
      <ellipse id="bicep-left" cx="60" cy="112" rx="8" ry="22"
        fill={fill('bicep-left')} opacity={opacity('bicep-left')} />
      <ellipse id="bicep-right" cx="140" cy="112" rx="8" ry="22"
        fill={fill('bicep-right')} opacity={opacity('bicep-right')} />

      {/* === TRICEPS (behind biceps, slightly offset) === */}
      <ellipse id="tricep-left" cx="56" cy="116" rx="6" ry="18"
        fill={fill('tricep-left')} opacity={opacity('tricep-left')} />
      <ellipse id="tricep-right" cx="144" cy="116" rx="6" ry="18"
        fill={fill('tricep-right')} opacity={opacity('tricep-right')} />

      {/* === FOREARMS === */}
      <rect id="forearm-left" x="52" y="136" width="12" height="30" rx="5"
        fill={fill('forearm-left')} opacity={opacity('forearm-left')} />
      <rect id="forearm-right" x="136" y="136" width="12" height="30" rx="5"
        fill={fill('forearm-right')} opacity={opacity('forearm-right')} />

      {/* === ABS === */}
      <path id="abs" d="M84 110 L116 110 L114 170 Q100 174 86 170 Z"
        fill={fill('abs')} opacity={opacity('abs')} />
      {/* abs detail lines */}
      {isActive('abs') && (
        <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.8">
          <line x1="88" y1="120" x2="112" y2="120" />
          <line x1="88" y1="132" x2="112" y2="132" />
          <line x1="89" y1="144" x2="111" y2="144" />
          <line x1="90" y1="156" x2="110" y2="156" />
          <line x1="100" y1="112" x2="100" y2="168" />
        </g>
      )}

      {/* === BACK (upper) — visible partially on sides === */}
      <path id="back-upper" d="M78 78 L72 84 L72 108 L80 108 Z"
        fill={fill('back-upper')} opacity={opacity('back-upper')} />
      <path d="M122 78 L128 84 L128 108 L120 108 Z"
        fill={fill('back-upper')} opacity={opacity('back-upper')} />

      {/* === BACK (lower / erectors) === */}
      <path id="back-lower" d="M82 150 L86 170 Q100 174 114 170 L118 150 L116 140 Q100 138 84 140 Z"
        fill={fill('back-lower')} opacity={opacity('back-lower') * 0.6} />

      {/* === GLUTES === */}
      <ellipse id="glute-left" cx="90" cy="188" rx="14" ry="12"
        fill={fill('glute-left')} opacity={opacity('glute-left')} />
      <ellipse id="glute-right" cx="110" cy="188" rx="14" ry="12"
        fill={fill('glute-right')} opacity={opacity('glute-right')} />

      {/* === QUADS === */}
      <path id="quad-left" d="M76 198 L84 198 Q88 240 86 280 L74 280 Q72 240 76 198 Z"
        fill={fill('quad-left')} opacity={opacity('quad-left')} />
      <path id="quad-right" d="M116 198 L124 198 Q128 240 126 280 L114 280 Q112 240 116 198 Z"
        fill={fill('quad-right')} opacity={opacity('quad-right')} />

      {/* === HAMSTRINGS (behind quads, inner) === */}
      <path id="hamstring-left" d="M84 200 L92 200 Q94 240 92 275 L86 275 Q84 240 84 200 Z"
        fill={fill('hamstring-left')} opacity={opacity('hamstring-left')} />
      <path id="hamstring-right" d="M108 200 L116 200 Q116 240 114 275 L108 275 Q106 240 108 200 Z"
        fill={fill('hamstring-right')} opacity={opacity('hamstring-right')} />

      {/* === KNEE joint === */}
      <ellipse cx="82" cy="285" rx="10" ry="6" fill="rgba(148,163,184,0.1)" />
      <ellipse cx="118" cy="285" rx="10" ry="6" fill="rgba(148,163,184,0.1)" />

      {/* === CALVES === */}
      <path id="calf-left" d="M74 292 Q78 316 80 348 L86 348 Q88 316 90 292 Q82 288 74 292 Z"
        fill={fill('calf-left')} opacity={opacity('calf-left')} />
      <path id="calf-right" d="M110 292 Q112 316 114 348 L120 348 Q122 316 126 292 Q118 288 110 292 Z"
        fill={fill('calf-right')} opacity={opacity('calf-right')} />

      {/* === FEET === */}
      <ellipse cx="82" cy="358" rx="10" ry="6" fill="rgba(148,163,184,0.12)" />
      <ellipse cx="118" cy="358" rx="10" ry="6" fill="rgba(148,163,184,0.12)" />

      {/* === HANDS === */}
      <ellipse cx="56" cy="172" rx="6" ry="8" fill="rgba(148,163,184,0.1)" />
      <ellipse cx="144" cy="172" rx="6" ry="8" fill="rgba(148,163,184,0.1)" />

      {/* Body outline for structure */}
      <path d="M66 66 Q54 72 54 90 L50 140 L52 170 M134 66 Q146 72 146 90 L150 140 L148 170"
        stroke="rgba(148,163,184,0.12)" strokeWidth="1" fill="none" />
      <path d="M76 174 Q76 190 74 198 M124 174 Q124 190 126 198"
        stroke="rgba(148,163,184,0.12)" strokeWidth="1" fill="none" />
    </svg>
  );
};

export default MuscleMap;
