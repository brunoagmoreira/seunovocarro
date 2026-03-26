import logoIcon from '@/assets/logo-icon.png';

interface LogoProps {
  variant?: 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  };

  const { icon, text } = sizes[size];

  if (variant === 'icon') {
    return (
      <img 
        src={logoIcon} 
        alt="Kairós Auto" 
        width={icon} 
        height={icon}
        className={`rounded-lg ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={logoIcon} 
        alt="Kairós Auto" 
        width={icon} 
        height={icon}
        className="rounded-lg"
      />
      <div className="flex flex-col leading-none">
        <span className={`font-heading font-bold ${text} gradient-kairos-text`}>
          KAIRÓS
        </span>
        <span className="text-xs font-medium text-muted-foreground tracking-widest">
          AUTO
        </span>
      </div>
    </div>
  );
}
