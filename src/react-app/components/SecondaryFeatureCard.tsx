import { Link } from 'react-router';

interface SecondaryFeatureCardProps {
  to: string;
  icon: string;
  title: string;
  imageUrl?: string;
  showCalendar?: boolean;
}

export default function SecondaryFeatureCard({ to, icon, title, imageUrl, showCalendar }: SecondaryFeatureCardProps) {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
  const dayOfMonth = today.getDate();
  
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105"
    >
      <div className="glass-dark p-4 h-full flex flex-col items-center justify-center text-center gap-2">
        {showCalendar ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white group-hover:scale-110 transition-transform shadow-lg">
            <div className="bg-red-500 text-white text-[8px] font-bold py-0.5 text-center">
              {dayOfWeek}
            </div>
            <div className="flex items-center justify-center h-[calc(100%-16px)] text-slate-900 font-bold text-xl">
              {dayOfMonth}
            </div>
          </div>
        ) : imageUrl ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden group-hover:scale-110 transition-transform">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="text-3xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
        <div className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors leading-tight">
          {title}
        </div>
      </div>
    </Link>
  );
}
