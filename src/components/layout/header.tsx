'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Brain, LogOut, User as UserIcon } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  if (!session) return null;

  const user = session.user;
  const fallbackInitials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('') || 'U';

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <Brain className="h-6 w-6 text-blue-400" />
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">AutomateAI</span>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-9 w-9">
              <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
              <AvatarFallback className="text-gray-700 dark:text-gray-300">{fallbackInitials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-xs text-gray-500 font-normal truncate">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="cursor-pointer text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
