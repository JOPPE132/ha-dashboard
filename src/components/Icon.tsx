interface Props {
  path: string
  size?: number | string
  className?: string
}

/** Renders a Material Design Icon path from @mdi/js. */
export function Icon({ path, size = 24, className }: Props) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  )
}
