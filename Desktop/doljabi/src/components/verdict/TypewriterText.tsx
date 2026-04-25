"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  prefix: string;
  text: string;
  className?: string;
  speed?: number;
}

export default function TypewriterText({
  prefix,
  text,
  className = "",
  speed = 200,
}: TypewriterTextProps) {
  const [displayedPrefix, setDisplayedPrefix] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const fullText = prefix + text;

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      if (index <= fullText.length) {
        const current = fullText.substring(0, index);
        if (index <= prefix.length) {
          setDisplayedPrefix(current);
          setDisplayedText("");
        } else {
          setDisplayedPrefix(prefix);
          setDisplayedText(current.substring(prefix.length));
        }
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [prefix, text, speed, fullText]);

  return (
    <div className={className}>
      <span className="text-gray-400 text-lg font-normal">{displayedPrefix}</span>
      <span>{displayedText}</span>
      {displayedText.length < text.length && (
        <span className="animate-pulse text-amber-400">▌</span>
      )}
    </div>
  );
}
