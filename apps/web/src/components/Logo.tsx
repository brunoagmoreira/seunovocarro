import Image from 'next/image';
import logoIcon from '@/assets/logo-new.png';

interface LogoProps {
  variant?: 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  light?: boolean;
}

export function Logo({ variant = 'full', size = 'md', className = '', light = false }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg', subtext: 'text-[10px]' },
    md: { icon: 44, text: 'text-xl', subtext: 'text-xs' },
    lg: { icon: 64, text: 'text-2xl', subtext: 'text-sm' },
  };

  const { icon, text, subtext } = sizes[size];

  if (variant === 'icon') {
    return (
      <Image 
        src={logoIcon} 
        alt="Seu Novo Carro" 
        width={icon} 
        height={icon}
        className={`${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image 
        src={logoIcon} 
        alt="Seu Novo Carro" 
        width={icon} 
        height={icon}
        className="object-contain"
      />
      <div className="flex flex-col leading-[0.9]">
        <span className={`font-bold ${text} tracking-tight ${light ? 'text-white' : 'text-primary'}`}>
          SEU NOVO
        </span>
        <span className={`font-black ${subtext} tracking-[0.3em] ${light ? 'text-white/90' : 'text-secondary'}`}>
          CARRO
        </span>
      </div>
    </div>
  );
}
