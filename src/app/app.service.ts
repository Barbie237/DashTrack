// src/app/core/services/state.service.ts
import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: Date;
  details?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalActions: number;
  criticalAlerts: number;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Signals pour l'état réactif
  private currentUserSignal: WritableSignal<User | null> = signal(null);
  private activityLogsSignal: WritableSignal<ActivityLog[]> = signal([]);
  private dashboardStatsSignal: WritableSignal<DashboardStats> = signal({
    totalUsers: 0,
    activeUsers: 0,
    totalActions: 0,
    criticalAlerts: 0
  });

  // Observables RxJS pour les flux de données
  private activityLogs$ = new BehaviorSubject<ActivityLog[]>([]);
  private userActions$ = new Subject<ActivityLog>();

  // Exposition publique des signals (read-only)
  readonly currentUser: Signal<User | null> = this.currentUserSignal.asReadonly();
  readonly activityLogs: Signal<ActivityLog[]> = this.activityLogsSignal.asReadonly();
  readonly dashboardStats: Signal<DashboardStats> = this.dashboardStatsSignal.asReadonly();

  // Signals calculés
  readonly isAdmin: Signal<boolean> = computed(() =>
    this.currentUser()?.role === UserRole.ADMIN
  );

  readonly isManager: Signal<boolean> = computed(() =>
    this.currentUser()?.role === UserRole.MANAGER || this.currentUser()?.role === UserRole.ADMIN
  );

  readonly filteredLogs: Signal<ActivityLog[]> = computed(() => {
    const user = this.currentUser();
    const logs = this.activityLogs();

    if (!user) return [];

    // Les admins voient tout, les managers voient leur équipe, les users voient leurs propres logs
    if (user.role === UserRole.ADMIN) {
      return logs;
    } else if (user.role === UserRole.MANAGER) {
      return logs.filter(log => log.userId !== 'system');
    } else {
      return logs.filter(log => log.userId === user.id);
    }
  });

  readonly recentLogs: Signal<ActivityLog[]> = computed(() => {
    const logs = this.filteredLogs();
    return logs.slice(0, 10); // 10 derniers logs
  });

  // Conversion Observable -> Signal
  readonly activityLogsFromStream: Signal<ActivityLog[]> = toSignal(
    this.activityLogs$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    { initialValue: [] }
  );

  constructor() {
    // Simulation de données initiales
    this.initializeMockData();

    // Écoute des actions utilisateur pour mise à jour automatique
    this.userActions$.subscribe(action => {
      // this.addActivityLog(action);
    });
  }

  // === Méthodes de gestion de l'utilisateur ===
  setCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
    this.logAction('login', 'authentication', 'Connexion utilisateur');
  }

  logout(): void {
    const user = this.currentUser();
    if (user) {
      this.logAction('logout', 'authentication', 'Déconnexion utilisateur');
    }
    this.currentUserSignal.set(null);
  }

  // === Méthodes de gestion des logs ===
  logAction(action: string, module: string, details?: string): void {
    const user = this.currentUser();
    if (!user) return;

    const log: ActivityLog = {
      id: this.generateId(),
      userId: user.id,
      userName: user.name,
      action,
      module,
      timestamp: new Date(),
      details
    };

    this.userActions$.next(log);
  }

  // private addActivityLog(log: ActivityLog): void {
  //   const currentLogs = this.activityLogsSignal();
  //   this.activityLogsSignal.set([log, ...currentLogs]);
  //   this.activityLogs$.next([log, ...currentLogs]);

  //   // Mise à jour des statistiques
  //   this.updateDashboardStats();
  // }

  getLogsObservable(): Observable<ActivityLog[]> {
    return this.activityLogs$.asObservable();
  }

  clearLogs(): void {
    this.activityLogsSignal.set([]);
    this.activityLogs$.next([]);
  }

  // === Méthodes de gestion du tableau de bord ===
  // private updateDashboardStats(): void {
  //   const logs = this.activityLogs();
  //   const uniqueUsers = new Set(logs.map(l => l.userId)).size;

  //   this.dashboardStatsSignal.update(stats => ({
  //     ...stats,
  //     totalActions: logs.length,
  //     activeUsers: uniqueUsers,
  //     criticalAlerts: logs.filter(l => l.action.includes('error') || l.action.includes('critical')).length
  //   }));
  // }

  // updateDashboardStats(stats: Partial<DashboardStats>): void {
  //   this.dashboardStatsSignal.update(current => ({
  //     ...current,
  //     ...stats
  //   }));
  // }

  // === Méthodes de filtrage ===
  filterLogsByModule(module: string): ActivityLog[] {
    return this.filteredLogs().filter(log => log.module === module);
  }

  filterLogsByDateRange(startDate: Date, endDate: Date): ActivityLog[] {
    return this.filteredLogs().filter(log =>
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  // === Utilitaires ===
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMockData(): void {
    // Simuler un utilisateur admin par défaut
    const adminUser: User = {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: UserRole.ADMIN
    };

    this.setCurrentUser(adminUser);

    // Ajouter quelques logs de démonstration
    const mockLogs: ActivityLog[] = [
      {
        id: this.generateId(),
        userId: '1',
        userName: 'Admin User',
        action: 'view_dashboard',
        module: 'dashboard',
        timestamp: new Date(Date.now() - 3600000),
        details: 'Consultation du tableau de bord'
      },
      {
        id: this.generateId(),
        userId: '2',
        userName: 'Manager User',
        action: 'export_report',
        module: 'reports',
        timestamp: new Date(Date.now() - 7200000),
        details: 'Export rapport mensuel'
      },
      {
        id: this.generateId(),
        userId: '1',
        userName: 'Admin User',
        action: 'update_settings',
        module: 'settings',
        timestamp: new Date(Date.now() - 10800000),
        details: 'Modification des paramètres système'
      }
    ];

    // mockLogs.forEach(log => this.addActivityLog(log));

    // Initialiser les stats
    // this.updateDashboardStats({
    //   totalUsers: 15,
    //   activeUsers: 8
    // });
  }
}
