import { Link } from 'react-router';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  featured?: boolean;
}

export default function FeatureCard({ 
  to, 
  icon: Icon, 
  title, 
  description, 
  gradient
}: FeatureCardProps) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Subtle gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      {/* Card content */}
      <div className="relative glass-dark p-6">
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        
        {/* Text */}
        <h3 className="text-lg font-bold text-white mb-2 font-display">
          {title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          {description}
        </p>
        
        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-400 group-hover:gap-3 transition-all">
          <span>Acessar</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
}
