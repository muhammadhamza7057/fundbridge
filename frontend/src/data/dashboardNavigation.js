import { FiBriefcase, FiFilter, FiHelpCircle, FiHome, FiMessageCircle, FiSettings } from 'react-icons/fi';

export const founderNavItems = [
  { group: 'main', label: 'Overview', to: '/dashboard/founder', icon: FiHome },
  { group: 'workspace', label: 'Chat', to: '/dashboard/founder/chat', icon: FiMessageCircle },
  { group: 'workspace', label: 'Deals', to: '/dashboard/founder/deals', icon: FiBriefcase },
  { group: 'bottom', label: 'Settings', to: '/dashboard/founder/settings', icon: FiSettings },
  { group: 'bottom', label: 'Help', to: '/dashboard/founder/help', icon: FiHelpCircle },
];

export const investorNavItems = [
  { group: 'main', label: 'Overview', to: '/dashboard/investor', icon: FiHome },
  { group: 'workspace', label: 'Filters', to: '/dashboard/investor/filters', icon: FiFilter },
  { group: 'workspace', label: 'Chat', to: '/dashboard/investor/chat', icon: FiMessageCircle },
  { group: 'workspace', label: 'Deals', to: '/dashboard/investor/deals', icon: FiBriefcase },
  { group: 'bottom', label: 'Settings', to: '/dashboard/investor/settings', icon: FiSettings },
  { group: 'bottom', label: 'Help', to: '/dashboard/investor/help', icon: FiHelpCircle },
];
