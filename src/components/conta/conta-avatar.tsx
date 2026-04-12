type Props = {
  name: string | null | undefined;
  imageUrl: string | null | undefined;
  size?: "lg" | "xl";
};

export function ContaAvatar({ name, imageUrl, size = "xl" }: Props) {
  const dim = size === "xl" ? 96 : 72;
  const initials = (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

  if (imageUrl) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full bg-movApp-subtle ring-2 ring-white shadow-md"
        style={{ width: dim, height: dim }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- URLs externas arbitrárias */}
        <img src={imageUrl} alt="" width={dim} height={dim} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-movApp-accentSoft to-movApp-subtle text-2xl font-semibold text-movApp-accent ring-2 ring-white shadow-md"
      style={{ width: dim, height: dim }}
    >
      {initials}
    </div>
  );
}
