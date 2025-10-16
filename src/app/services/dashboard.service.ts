import { computed, Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { UserRole } from '../models/user.model';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalActivities: number;
  averageSessionTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

    private statsSignal = signal<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalActivities: 0,
    averageSessionTime: 0
  });

  stats = this.statsSignal.asReadonly();

  // Computed pour des statistiques dérivées
  userEngagement = computed(() => {
    const stats = this.statsSignal();
    return stats.totalUsers > 0
      ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
      : 0;
  });

  constructor() {
    this.loadStats();
  }

  private loadStats(): void {
    // Simulation de chargement de données
    setTimeout(() => {
      this.statsSignal.set({
        totalUsers: 150,
        activeUsers: 89,
        totalActivities: 1247,
        averageSessionTime: 25
      });
    }, 500);
  }

  getStatsForRole(role: UserRole): Observable<DashboardStats> {
    const baseStats = this.statsSignal();

    // Personnalisation selon le rôle
    if (role === UserRole.USER) {
      return of({
        ...baseStats,
        totalUsers: 1,
        activeUsers: 1
      }).pipe(delay(300));
    }

    return of(baseStats).pipe(delay(300));
  }

  refreshStats(): void {
    this.loadStats();
  }
}
