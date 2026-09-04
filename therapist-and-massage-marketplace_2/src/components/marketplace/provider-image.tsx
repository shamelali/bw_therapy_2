import Image from "next/image";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-teal-400 to-emerald-600",
  "from-sky-400 to-indigo-600",
  "from-rose-400 to-orange-500",
  "from-violet-400 to-fuchsia-600",
  "from-amber-400 to-orange-600",
];

function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

type Props = {
  src: string | null | undefined;
  id: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

/**
 * Renders a provider's image when one is available, or a deterministic
 * gradient placeholder (with the provider's name) when it is not.
 *
 * When an image is present, the outer div is `relative` and `fill` should be
 * true so the image fills the container.
 */
export function ProviderImage({ src, id, alt = "", className, imgClassName, fill, priority, sizes }: Props) {
  const gradient = gradientFor(id);
  const hasImage = Boolean(src);

  const base = cn("bg-gradient-to-br", gradient, className);

  if (!hasImage) {
    return <div aria-hidden className={cn(base, "relative")} />;
  }

  return (
    <div className={cn(base, "relative")}>
      <Image
        src={src as string}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imgClassName)}
      />
    </div>
  );
}
