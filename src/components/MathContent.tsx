import React from 'react';
import type { QuestionOption, QuestionRichBlock } from '../types/exam';

function Fraction({
  num,
  den,
  compact = false,
}: {
  num: React.ReactNode;
  den: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex flex-col items-center align-middle leading-none ${
        compact ? 'mx-0.5 text-[0.88em]' : 'mx-1'
      }`}
    >
      <span className="px-1 pb-0.5">{num}</span>
      <span className="w-full border-t border-current" />
      <span className="px-1 pt-0.5">{den}</span>
    </span>
  );
}

function Radical({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-stretch align-middle">
      <span
        aria-hidden="true"
        className="select-none font-serif text-[1.15em] leading-none pr-0.5 flex items-end"
      >
        √
      </span>
      <span className="border-t border-current pt-0.5 px-1 leading-tight">
        {children}
      </span>
    </span>
  );
}

export function MatchstickGrid({
  rows,
  cols,
}: {
  rows: number;
  cols: number;
}) {
  const cell = 38;
  const pad = 10;
  const width = cols * cell + pad * 2;
  const height = rows * cell + pad * 2;

  return (
    <div className="my-2.5 inline-block">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${rows}x${cols} birim karelik kibrit çöpü şekli`}
        className="text-ink"
      >
        {Array.from({ length: rows + 1 }).map((_, r) => (
          <line
            key={`h-${r}`}
            x1={pad}
            y1={pad + r * cell}
            x2={pad + cols * cell}
            y2={pad + r * cell}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="square"
          />
        ))}
        {Array.from({ length: cols + 1 }).map((_, c) => (
          <line
            key={`v-${c}`}
            x1={pad + c * cell}
            y1={pad}
            x2={pad + c * cell}
            y2={pad + rows * cell}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="square"
          />
        ))}
      </svg>
    </div>
  );
}

export function RichQuestionBlock({ block }: { block: QuestionRichBlock }) {
  if (block.type === 'text') {
    return <p className="font-serif text-[15.5px] leading-relaxed text-ink">{block.content}</p>;
  }

  if (block.type === 'matchstick_grid') {
    return <MatchstickGrid rows={block.rows} cols={block.cols} />;
  }

  if (block.type === 'numbered_lines') {
    return (
      <ol className="space-y-1 font-serif text-[15px] leading-relaxed text-ink pl-1">
        {block.lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>
    );
  }

  // Crisp print-grade mathematical notation matching the official KHK exam booklet
  switch (block.id) {
    case 'mat_1':
      return (
        <div className="font-serif text-[17px] font-semibold tracking-wide text-ink py-1">
          (3<sup className="text-[0.72em]">4</sup> − 4<sup className="text-[0.72em]">3</sup>) : (5
          <sup className="text-[0.72em]">2</sup> − 2<sup className="text-[0.72em]">3</sup>)
        </div>
      );

    case 'mat_2':
      return (
        <div className="font-serif text-[17px] font-medium tracking-wide text-ink py-1">
          28 × 5 : 2 + 5
        </div>
      );

    case 'mat_3':
      return (
        <div className="font-serif text-[16px] text-ink py-1.5 flex items-center flex-wrap gap-1">
          <Fraction num="0.06" den="0.003" />
          <span className="mx-1">+</span>
          <Fraction num="2.4" den="0.08" />
          <span className="mx-1">−</span>
          <Fraction num="1" den="0.1" />
        </div>
      );

    case 'mat_4':
      return (
        <div className="font-serif text-[17px] text-ink py-2">
          <Radical>
            <span>6 + </span>
            <Radical>
              <span>4 + </span>
              <Radical>25</Radical>
            </Radical>
          </Radical>
        </div>
      );

    case 'mat_5':
      return (
        <div className="font-serif text-[16px] text-ink py-2 flex items-center flex-wrap gap-1">
          <span className="italic mr-1">X</span>
          <span className="mr-1">=</span>
          <Fraction num="2" den={<Fraction num="4" den="5" compact />} />
          <span className="mx-1.5">:</span>
          <span className="inline-flex items-center">
            <span className="text-[2.2em] font-light leading-none">(</span>
            <Fraction num={<Fraction num="3" den="4" compact />} den="5" />
            <span className="text-[2.2em] font-light leading-none">)</span>
            <sup className="text-[0.75em] -mt-6 ml-0.5">−1</sup>
          </span>
        </div>
      );

    case 'mat_7':
      return (
        <div className="font-serif text-[16.5px] font-medium text-ink py-1">
          5(<span className="italic">x</span> + 1) − 4<span className="italic">x</span> + 11 = 25
        </div>
      );

    case 'mat_13':
      return (
        <div className="font-serif italic text-[16.5px] text-ink py-1">
          x = 2(t − sin t), &nbsp; y = 2(1 − cos t)
        </div>
      );

    case 'mat_14':
      return (
        <div className="font-serif text-[15.5px] leading-relaxed text-ink py-1">
          Türevi kendisinin iki katına eşit olan pozitif bir{' '}
          <span className="italic text-[1.1em]">f</span> fonksiyonu için{' '}
          <span className="italic text-[1.08em]">f(2) = 1</span> ise{' '}
          <span className="italic text-[1.08em]">f(1) = ?</span>
        </div>
      );

    case 'mat_15':
      return (
        <div className="font-serif text-[18px] text-ink py-1.5 flex items-center gap-1">
          <span className="text-[1.6em] leading-none font-normal mr-0.5">∫</span>
          <span className="italic">x</span>
          <sup className="text-[0.7em] -ml-0.5">3</sup>
          <span>
            (2 + <span className="italic">x</span>
            <sup className="text-[0.7em]">4</sup>)
            <sup className="text-[0.7em]">3</sup>
          </span>
          <span className="ml-1">d</span>
          <span className="italic -ml-1">x</span>
        </div>
      );

    default:
      return null;
  }
}

export function MathOptionContent({
  mathId,
}: {
  mathId: NonNullable<QuestionOption['mathId']>;
}) {
  switch (mathId) {
    case 'sqrt_13':
      return (
        <span className="font-serif text-[15.5px]">
          <Radical>13</Radical>
        </span>
      );
    case 'sqrt_35':
      return (
        <span className="font-serif text-[15.5px]">
          <Radical>35</Radical>
        </span>
      );
    case 'cyc_a':
      return (
        <span className="font-serif text-[15px] inline-flex items-center">
          (π, <Fraction num="8" den="3" compact />)
        </span>
      );
    case 'cyc_b':
      return (
        <span className="font-serif text-[15px] inline-flex items-center">
          (<Fraction num="2π" den="3" compact />, <Fraction num="8" den="3" compact />)
        </span>
      );
    case 'cyc_c':
      return (
        <span className="font-serif text-[15px] inline-flex items-center">
          (2π, <Fraction num="8" den="3" compact />)
        </span>
      );
    case 'cyc_d':
      return (
        <span className="font-serif text-[15px] inline-flex items-center">
          (2π, <Fraction num="1" den="6" compact />)
        </span>
      );
    case 'cyc_e':
      return (
        <span className="font-serif text-[15px] inline-flex items-center">
          (π, <Fraction num="2" den="3" compact />)
        </span>
      );
    case 'exp_m1':
      return (
        <span className="font-serif italic text-[16px]">
          e<sup className="not-italic text-[0.72em]">−1</sup>
        </span>
      );
    case 'exp_m4':
      return (
        <span className="font-serif italic text-[16px]">
          e<sup className="not-italic text-[0.72em]">−4</sup>
        </span>
      );
    case 'exp_m2':
      return (
        <span className="font-serif italic text-[16px]">
          e<sup className="not-italic text-[0.72em]">−2</sup>
        </span>
      );
    case 'exp_m3':
      return (
        <span className="font-serif italic text-[16px]">
          e<sup className="not-italic text-[0.72em]">−3</sup>
        </span>
      );
    case 'int_a':
      return (
        <span className="font-serif text-[15px] inline-flex items-center">
          <Fraction
            num={
              <span>
                (2 + <i className="italic">x</i>
                <sup>4</sup>)<sup>4</sup>
              </span>
            }
            den="32"
            compact
          />
          <span className="ml-1">+ c</span>
        </span>
      );
    case 'int_b':
      return (
        <span className="font-serif text-[15px] inline-flex items-center">
          <Fraction
            num={
              <span>
                (2 − <i className="italic">x</i>
                <sup>4</sup>)<sup>4</sup>
              </span>
            }
            den="8"
            compact
          />
          <span className="ml-1">+ c</span>
        </span>
      );
    case 'int_c':
      return (
        <span className="font-serif text-[15px] inline-flex items-center">
          <Fraction
            num={
              <span>
                (2 + <i className="italic">x</i>
                <sup>4</sup>)<sup>4</sup>
              </span>
            }
            den="8"
            compact
          />
          <span className="ml-1">+ c</span>
        </span>
      );
    case 'int_d':
      return (
        <span className="font-serif text-[15px] inline-flex items-center">
          <Fraction
            num={
              <span>
                (2 + <i className="italic">x</i>
                <sup>4</sup>)<sup>4</sup>
              </span>
            }
            den="16"
            compact
          />
          <span className="ml-1">+ c</span>
        </span>
      );
    case 'int_e':
      return (
        <span className="font-serif text-[15px] inline-flex items-center">
          <Fraction
            num={
              <span>
                (2 + <i className="italic">x</i>
                <sup>4</sup>)<sup>4</sup>
              </span>
            }
            den="2"
            compact
          />
          <span className="ml-1">+ c</span>
        </span>
      );
    default:
      return null;
  }
}
