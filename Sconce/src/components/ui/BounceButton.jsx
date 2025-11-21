import { useState } from 'react';

const BounceButton = ({ href, children, kind = 'primary', className = '' }) => {
  const [bouncing, setBouncing] = useState(false);
  return (
    <a
      href={href}
      onClick={() => { setBouncing(true); setTimeout(() => setBouncing(false), 450); }}
      className={`${kind === 'primary' ? 'btn-primary' : 'btn-accent'} ${bouncing ? 'animate-bounce-soft' : ''} ${className}`}
    >
      {children}
    </a>
  );
};

export default BounceButton;
