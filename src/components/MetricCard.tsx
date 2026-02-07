interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  valueColor?: string;
  badge?: string;
  badgeColor?: string;
}

const MetricCard = ({ title, value, subtitle, valueColor, badge, badgeColor }: MetricCardProps) => {
  return (
    <div className="quantra-card px-6 py-5 flex-1 min-w-[180px]">
      <p className="text-sm text-muted-foreground mb-1.5">{title}</p>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className={`text-2xl font-semibold tracking-tight ${valueColor || "text-foreground"}`}>
          {value}
        </p>
        {badge && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${badgeColor || "text-quantra-green"}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default MetricCard;
