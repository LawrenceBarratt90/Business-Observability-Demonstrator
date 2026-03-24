import React, { useState, useRef, useEffect } from 'react';
import Colors from '@dynatrace/strato-design-tokens/colors';

interface InfoSection { label: string; detail: string; }

interface InfoButtonProps {
  title: string;
  description: string;
  sections: InfoSection[];
  footer?: string;
  color?: string;
  width?: number;
  /** Where the tooltip opens relative to the ? icon. Default: 'right' (aligns right edge). */
  align?: 'left' | 'right' | 'center';
}

/**
 * A small circled "?" that shows a hover tooltip with page/feature information.
 * Matches the existing HomePage header tooltip style.
 */
export const InfoButton: React.FC<InfoButtonProps> = ({
  title,
  description,
  sections,
  footer,
  color = Colors.Theme.Primary['70'],
  width = 300,
  align = 'right',
}) => {
  const [show, setShow] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const [resolvedAlign, setResolvedAlign] = useState(align);

  // Auto-detect when tooltip would go off-screen and flip alignment
  useEffect(() => {
    if (show && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      if (align === 'right' && rect.left < width + 20) {
        setResolvedAlign('left');
      } else if (align === 'left' && rect.right + width > window.innerWidth - 20) {
        setResolvedAlign('right');
      } else {
        setResolvedAlign(align);
      }
    }
  }, [show, align, width]);

  const positionStyle: React.CSSProperties =
    resolvedAlign === 'left'  ? { left: 0 } :
    resolvedAlign === 'center' ? { left: '50%', transform: 'translateX(-50%)' } :
    /* right */ { right: 0 };

  return (
    <div
      ref={btnRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: `${color}15`,
          border: `1.5px solid ${color}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'help',
          fontSize: 10,
          fontWeight: 700,
          color,
          flexShrink: 0,
          transition: 'all 0.15s ease',
          ...(show ? { background: `${color}25`, borderColor: `${color}88` } : {}),
        }}
      >
        ?
      </div>
      {show && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            ...positionStyle,
            width,
            padding: '12px 14px',
            borderRadius: 10,
            background: Colors.Background.Surface.Default,
            border: `1.5px solid ${Colors.Border.Neutral.Default}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            zIndex: 10000,
            fontSize: 12,
            lineHeight: 1.55,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{title}</div>
          <div style={{ marginBottom: 6, opacity: 0.85 }}>{description}</div>
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 3, display: 'flex', gap: 4 }}>
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>
              <span style={{ opacity: 0.7 }}>— {s.detail}</span>
            </div>
          ))}
          {footer && (
            <div style={{ marginTop: 6, fontSize: 11, opacity: 0.55, fontStyle: 'italic' }}>{footer}</div>
          )}
        </div>
      )}
    </div>
  );
};
