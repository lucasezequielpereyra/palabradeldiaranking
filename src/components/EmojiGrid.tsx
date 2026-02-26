"use client";

interface EmojiGridProps {
  grid: string;
  size?: "sm" | "md" | "lg";
}

export default function EmojiGrid({ grid, size = "md" }: EmojiGridProps) {
  const sizeClass = {
    sm: "text-sm leading-5",
    md: "text-xl leading-7",
    lg: "text-2xl leading-8",
  }[size];

  return (
    <div className={`font-mono ${sizeClass} tracking-wide`}>
      {grid.split("\n").map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}
