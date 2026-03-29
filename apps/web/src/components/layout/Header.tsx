import Link from 'next/link';
import { Search, User, Menu, LogOut, Settings, Car, Heart, MessageSquare, MessageCircle, BarChart3, UserCircle, FileText, Store, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { user, profile, isAdmin, isEditor, signOut } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="touch-target flex items-center">
          <Logo size="sm" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/veiculos" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Veículos
          </Link>
          <Link 
            href="/blog" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          {isEditor && (
            <Link 
              href="/anunciar" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Anunciar
            </Link>
          )}
          <Link 
            href="/impulsionar" 
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Rocket className="h-4 w-4" />
            Impulsionar
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/veiculos">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          
          {/* Notification Bell for editors/admins */}
          {user && (isEditor || isAdmin) && <NotificationBell />}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{profile?.full_name || 'Usuário'}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favoritos" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Favoritos
                  </Link>
                </DropdownMenuItem>
                {isEditor && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/meus-anuncios" className="cursor-pointer">
                        <Car className="mr-2 h-4 w-4" />
                        Meus Anúncios
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/meus-leads" className="cursor-pointer">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Meus Leads
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/metricas" className="cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Métricas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/conversas" className="cursor-pointer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Conversas
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/blog" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Admin Blog
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/lojistas" className="cursor-pointer">
                        <Store className="mr-2 h-4 w-4" />
                        Lojistas
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="gradient-brand text-white shadow-brand hover:opacity-90" size="sm" asChild>
              <Link href="/login">
                <User className="h-4 w-4 mr-2" />
                Entrar
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/veiculos">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <Logo size="md" />
                
                {user && (
                  <Link href="/perfil">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{profile?.full_name || 'Usuário'}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </Link>
                )}
                
                <nav className="flex flex-col gap-4">
                  <SheetClose asChild>
                    <Link 
                      href="/veiculos" 
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      Veículos
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link 
                      href="/blog" 
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      Blog
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link 
                      href="/impulsionar" 
                      className="inline-flex items-center gap-2 text-lg font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <Rocket className="h-5 w-5" />
                      Impulsionar
                    </Link>
                  </SheetClose>
                  {user && (
                    <SheetClose asChild>
                      <Link 
                        href="/favoritos" 
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        Favoritos
                      </Link>
                    </SheetClose>
                  )}
                  {isEditor && (
                    <>
                      <SheetClose asChild>
                        <Link 
                          href="/anunciar" 
                          className="text-lg font-medium hover:text-primary transition-colors"
                        >
                          Anunciar
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link 
                          href="/meus-anuncios" 
                          className="text-lg font-medium hover:text-primary transition-colors"
                        >
                          Meus Anúncios
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link 
                          href="/meus-leads" 
                          className="text-lg font-medium hover:text-primary transition-colors"
                        >
                          Meus Leads
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link 
                          href="/metricas" 
                          className="text-lg font-medium hover:text-primary transition-colors"
                        >
                          Métricas
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link 
                          href="/conversas" 
                          className="text-lg font-medium hover:text-primary transition-colors"
                        >
                          Conversas
                        </Link>
                      </SheetClose>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <SheetClose asChild>
                        <Link 
                          href="/admin" 
                          className="text-lg font-medium hover:text-primary transition-colors"
                        >
                          Painel Admin
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link 
                          href="/admin/blog" 
                          className="text-lg font-medium hover:text-primary transition-colors"
                        >
                          Admin Blog
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </nav>
                
                <div className="pt-4 border-t border-border">
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full text-destructive border-destructive hover:bg-destructive/10"
                      onClick={signOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  ) : (
                    <Button className="gradient-brand text-white shadow-brand hover:opacity-90 w-full" asChild>
                      <Link href="/login">
                        <User className="h-4 w-4 mr-2" />
                        Entrar / Cadastrar
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
