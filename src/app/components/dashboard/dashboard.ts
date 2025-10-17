import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { TrackingService } from '../../services/tracking.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  currentUser = signal<User | null>(null);
  dashboardStats = signal<any>(null);

  // Computed signals
  engagement = computed(() => this.dashboardService.userEngagement());

  userActivities = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.trackingService.getActivitiesByRole(user.role);
  });

  mockUsers: User[] = [
    {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@company.com',
      role: UserRole.ADMIN
    },
    {
      id: 'manager-1',
      name: 'Manager User',
      email: 'manager@company.com',
      role: UserRole.MANAGER
    },
    {
      id: 'user-1',
      name: 'Regular User',
      email: 'user@company.com',
      role: UserRole.USER
    }
  ];

  constructor(
    private dashboardService: DashboardService,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    // Sélectionner le premier utilisateur par défaut
    this.selectUser(this.mockUsers[0]);
  }

  selectUser(user: User): void {
    this.currentUser.set(user);
    this.trackingService.setCurrentUser(user);

    // Charger les stats selon le rôle avec RxJS
    this.dashboardService.getStatsForRole(user.role).subscribe(stats => {
      this.dashboardStats.set(stats);
    });
  }

  getUserButtonClass(user: User): string {
    const isSelected = this.currentUser()?.id === user.id;
    const baseClass = 'transition-all duration-300';

    if (isSelected) {
      return `${baseClass} bg-white text-purple-900 shadow-lg scale-105`;
    }
    return `${baseClass} bg-white/20 text-white hover:bg-white/30`;
  }

  getRoleBadgeClass(role: UserRole): string {
    const baseClass = 'inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2';
    const roleClasses = {
      [UserRole.ADMIN]: 'bg-red-500/20 text-red-300 border border-red-500/30',
      [UserRole.MANAGER]: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      [UserRole.USER]: 'bg-green-500/20 text-green-300 border border-green-500/30'
    };
    return `${baseClass} ${roleClasses[role]}`;
  }

  getAccessLevel(role: UserRole): string {
    const levels = {
      [UserRole.ADMIN]: 'Complet',
      [UserRole.MANAGER]: 'Élevé',
      [UserRole.USER]: 'Standard'
    };
    return levels[role];
  }

  getAccessDescription(): string {
    const user = this.currentUser();
    if (!user) return '';

    const descriptions = {
      [UserRole.ADMIN]: 'Accès complet à toutes les activités du système',
      [UserRole.MANAGER]: 'Accès aux 20 dernières activités',
      [UserRole.USER]: 'Accès uniquement à vos propres activités'
    };
    return descriptions[user.role];
  }

  canViewStat(stat: string): boolean {
    const user = this.currentUser();
    if (!user) return false;

    const permissions = {
      [UserRole.ADMIN]: ['totalUsers', 'activeUsers', 'totalActivities', 'averageSessionTime'],
      [UserRole.MANAGER]: ['activeUsers', 'totalActivities', 'averageSessionTime'],
      [UserRole.USER]: ['totalActivities', 'averageSessionTime']
    };

    return permissions[user.role].includes(stat);
  }

  getPermissions(): Array<{name: string, granted: boolean}> {
    const user = this.currentUser();
    if (!user) return [];

    const allPermissions = [
      { name: 'Voir tous les utilisateurs', roles: [UserRole.ADMIN] },
      { name: 'Voir toutes les activités', roles: [UserRole.ADMIN] },
      { name: 'Gérer les utilisateurs', roles: [UserRole.ADMIN] },
      { name: 'Voir activités récentes', roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { name: 'Voir statistiques', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER] },
      { name: 'Exporter données', roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { name: 'Modifier profil', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER] },
      { name: 'Voir tableau de bord', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER] },
      { name: 'Créer rapports', roles: [UserRole.ADMIN, UserRole.MANAGER] }
    ];

    return allPermissions.map(perm => ({
      name: perm.name,
      granted: perm.roles.includes(user.role)
    }));
  }

  formatTime(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `Il y a ${hours}h`;
    if (minutes > 0) return `Il y a ${minutes}min`;
    return `Il y a ${seconds}s`;
  }
}
