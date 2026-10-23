"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  loading?: boolean;
}

export default function SearchBar({ value, onChange, loading }: Props) {
  return (
    <div className="wl-search">
      <label htmlFor="wl-q" className="wl-sr">Search movies and shows</label>
      <input
        id="wl-q"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for a movie or show"
        autoComplete="off"
      />
      {loading && <span className="wl-spinner" aria-label="Searching" />}
    </div>
  );
}