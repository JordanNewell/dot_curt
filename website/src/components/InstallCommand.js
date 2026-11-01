import React, { useState } from 'react';

const CMD = 'npm install curt-format';

export default function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CMD);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="lp-install">
      <span className="ps">$</span>
      <code>{CMD}</code>
      <button type="button" onClick={copy} aria-label="Copy install command">
        {copied ? 'copied' : 'copy'}
      </button>
    </div>
  );
}
