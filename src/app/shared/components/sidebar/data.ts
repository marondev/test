export const mainRoutes = [
  { path: '/dashboard', title: 'Dashboard', icon: 'dashboard', role: ['admin', 'editor', 'user'] },
  { path: '/ordinances', title: 'Ordinances', icon: 'assignment', role: ['admin', 'editor', 'user'] },
  { path: '/resolutions', title: 'Resolutions', icon: 'gavel', role: ['admin', 'editor', 'user'] },
  { path: '/sessions', title: 'Sessions', icon: 'hourglass_full', role: ['admin', 'editor', 'user'] },
  {
    path: '/committee-reports',
    title: 'Committee Reports',
    icon: 'assignment',
    role: ['admin', 'editor', 'user']
  },
  {
    path: '/privilege-speeches',
    title: 'Privilege Speeches',
    icon: 'mic',
    role: ['admin', 'editor', 'user']
  },
  {
    path: '/vehicle-franchise',
    title: 'Regulations',
    icon: 'announcement',
    subItems: [
      {
        path: '/vehicle-franchise',
        title: 'Vehicle Franchise',
        icon: 'local_shipping',
      },
      { path: '/accreditation', title: 'NGO Accreditation', icon: 'stars' },
      { path: '/subdivisions', title: 'Subdivisions', icon: 'home_work' },
      { path: '/others', title: 'Others', icon: 'more_horizontal' },
    ],
    role: ['admin', 'editor', 'user']
  },
  { path: '/memoranda', title: 'Memoranda', icon: 'cases', role: ['admin', 'editor', 'user'] },
  { path: '/members', title: 'Members', icon: 'groups', role: ['admin'] },
  { path: '/references', title: 'References', icon: 'local_library', role: ['admin', 'editor', 'user'] },
  {
    path: '/users',
    title: 'Editors',
    icon: 'create',
    class: 'border-top mt-3 pt-3',
    role: ['admin']
  },
  { path: '/committees', title: 'Committees', icon: 'public', role: ['admin', 'editor'] },
  // { path: '/settings', title: 'Settings', icon: 'settings' },
  { path: '/account', title: 'Account', icon: 'account_circle', role: ['admin','user'] },
  { path: '/logs', title: 'Logs', icon: 'library_books', role: ['admin'] },
];
