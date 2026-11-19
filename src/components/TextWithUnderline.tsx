import React from 'react';

interface TextWithUnderlineProps {
  text: string;
  underlineWord?: string;
}

export function TextWithUnderline({
  text,
  underlineWord,
}: TextWithUnderlineProps) {
  if (!underlineWord) {
    return <>{text}</>;
  }

  const index = text.indexOf(underlineWord);
  if (index === -1) {
    return <>{text}</>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + underlineWord.length);
  const after = text.slice(index + underlineWord.length);

  return (
    <>
      {before}
      <span className="underline decoration-ink decoration-[1.5px] underline-offset-[3px]">
        {match}
      </span>
      {after}
    </>
  );
}
