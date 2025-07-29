
export type AppRole = 'admin' | 'moderator' | 'helper' | 'editor' | 'member' | 'vip' | 'kala' | 'fancy_kala' | 'golden_kala';

export const isStaffRole = (role: string): boolean => {
  return ['admin', 'moderator', 'helper'].includes(role);
};

export const isSupporterRole = (role: string): boolean => {
  return ['vip', 'kala', 'fancy_kala', 'golden_kala'].includes(role);
};

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'moderator':
      return 'Moderator';
    case 'helper':
      return 'Helper';
    case 'editor':
      return 'Editor';
    case 'member':
      return 'Member';
    case 'vip':
      return 'VIP';
    case 'kala':
      return 'Kala';
    case 'fancy_kala':
      return 'Fancy Kala';
    case 'golden_kala':
      return 'Golden Kala';
    default:
      return role;
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'text-yellow-600';
    case 'moderator':
      return 'text-blue-600';
    case 'helper':
      return 'text-green-600';
    case 'editor':
      return 'text-purple-600';
    case 'vip':
      return 'text-amber-600';
    case 'kala':
      return 'text-pink-600';
    case 'fancy_kala':
      return 'text-indigo-600';
    case 'golden_kala':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'moderator':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'helper':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'editor':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'vip':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'kala':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'fancy_kala':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'golden_kala':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy: Record<string, number> = {
    'admin': 100,
    'moderator': 80,
    'helper': 60,
    'editor': 40,
    'member': 20,
    'vip': 15,
    'kala': 10,
    'fancy_kala': 8,
    'golden_kala': 5
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
};
