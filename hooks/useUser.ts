import { useSession } from "next-auth/react";
import { User } from '@/types/user' // Adjust the import path as needed

export function useUser() {
  const { data: session } = useSession();

  return {
    user: session?.user ? {
      ...session.user,
      initials: session.user.name
        ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : '??',
      image: session.user.image || undefined, // Add this line
    } as User & { image?: string } : null
  };
}
