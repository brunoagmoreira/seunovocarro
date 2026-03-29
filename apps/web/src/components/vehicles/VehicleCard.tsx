import { memo } from 'react';
import Link from 'next/link';
import { Heart, Flame } from 'lucide-react';
import { Vehicle, FUEL_TYPES, TRANSMISSION_TYPES } from '@/types/vehicle';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface VehicleCardProps {
  vehicle: Vehicle;
  className?: string;
}

export const VehicleCard = memo(function VehicleCard({ vehicle, className }: VehicleCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('pt-BR').format(mileage);
  };

  // Calculate installment (60 months, 1.5% interest)
  const calculateInstallment = (price: number) => {
    const rate = 0.015;
    const months = 60;
    const installment = price * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return formatPrice(installment);
  };

  // Check if vehicle is new (less than 7 days old)
  const isNew = () => {
    const createdAt = new Date(vehicle.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  };

  return (
    <Link 
      href={`/veiculo/${vehicle.slug}`}
      className={cn(
        "group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 w-full",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <OptimizedImage
          src={vehicle.images[0]?.url}
          alt={`${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} ${vehicle.year}`}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          aspectRatio="4/3"
        />
        
        {/* Display ID Badge */}
        {vehicle.displayId && (
          <Badge className="absolute top-3 left-3 bg-primary/90 hover:bg-primary text-white border-0 font-mono text-xs">
            {vehicle.displayId}
          </Badge>
        )}
        
        {/* New Badge */}
        {isNew() && (
          <Badge className={`absolute top-3 ${vehicle.displayId ? 'left-16' : 'left-3'} bg-orange-500 hover:bg-orange-600 text-white border-0`}>
            <Flame className="h-3 w-3 mr-1" />
            NOVO
          </Badge>
        )}
        
        {/* Favorite Button */}
        <button 
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive transition-colors touch-target"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Toggle favorite
          }}
        >
          <Heart className="h-5 w-5" />
        </button>

        {/* Status Badge */}
        {vehicle.status === 'pending' && (
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-yellow-500/90 text-white text-xs font-medium">
            Pendente
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-heading font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
          {vehicle.brand} {vehicle.model}
        </h3>
        
        {/* Version */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {vehicle.version}
        </p>

        {/* Specs Row */}
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <span>{vehicle.year}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>{formatMileage(vehicle.mileage)} km</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>{TRANSMISSION_TYPES[vehicle.transmission]}</span>
        </div>

        {/* Price + Installments */}
        <div className="mb-2">
          <span className="font-heading font-bold text-xl gradient-brand-text">
            {formatPrice(vehicle.price)}
          </span>
          <p className="text-xs text-muted-foreground">
            ou 60x de {calculateInstallment(vehicle.price)}
          </p>
        </div>

        {/* Location & Views */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <OptimizedImage
              src={vehicle.seller.avatarUrl}
              alt={`Vendedor ${vehicle.seller.name}`}
              className="w-6 h-6 rounded-full"
              aspectRatio="1/1"
            />
            <span className="text-xs text-muted-foreground">
              {vehicle.city}, {vehicle.state}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});
