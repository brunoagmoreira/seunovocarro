import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'editor' | 'admin';
  requireApproval?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireApproval = false 
}: ProtectedRouteProps) {
  const { user, userRole, isLoading, isApproved } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const roleHierarchy = { user: 1, editor: 2, admin: 3 };
    const userLevel = roleHierarchy[userRole || 'user'];
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return <Navigate to="/" replace />;
    }
  }

  if (requireApproval && !isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-6 max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full gradient-kairos-soft flex items-center justify-center">
            <span className="text-4xl">⏳</span>
          </div>
          <h1 className="font-heading text-2xl font-bold mb-4">Aguardando aprovação</h1>
          <p className="text-muted-foreground">
            Seu cadastro como vendedor está em análise. 
            Você receberá um e-mail quando for aprovado.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
