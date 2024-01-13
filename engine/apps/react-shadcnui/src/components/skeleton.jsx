export default {
  '/src/components/ui/skeleton.jsx': `
import { cn } from "lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (<div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />);
}

export { Skeleton }
  `
}

