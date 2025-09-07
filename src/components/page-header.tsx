
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10", className)}>
      <div>
        <h1 className="text-4xl font-headline font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-2 text-lg">{description}</p>}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}
