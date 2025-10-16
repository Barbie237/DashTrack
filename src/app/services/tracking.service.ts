import { computed, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Activity } from '../models/activity.model';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

 // Signals pour la gestion d'état moderne
  private activitiesSignal = signal<Activity[]>([]);
  private currentUserSignal = signal<User | null>(null);

  // RxJS pour les flux de données temps réel
  private activities$ = new BehaviorSubject<Activity[]>([]);

  // Computed signals
  totalActivities = computed(() => this.activitiesSignal().length);

  recentActivities = computed(() =>
    this.activitiesSignal().slice(0, 10)
  );

  activitiesByUser = computed(() => {
    const activities = this.activitiesSignal();
    const grouped = new Map<string, number>();
    activities.forEach(activity => {
      grouped.set(activity.userId, (grouped.get(activity.userId) || 0) + 1);
    });
    return grouped;
  });

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockActivities: Activity[] = [
      {
        id: '1',
        userId: 'user-1',
        action: 'LOGIN',
        timestamp: new Date(Date.now() - 3600000),
        details: 'Connexion réussie',
        page: '/login'
      },
      {
        id: '2',
        userId: 'user-2',
        action: 'VIEW_PAGE',
        timestamp: new Date(Date.now() - 7200000),
        details: 'Consultation du tableau de bord',
        page: '/dashboard',
        duration: 45
      },
      {
        id: '3',
        userId: 'user-1',
        action: 'UPDATE_PROFILE',
        timestamp: new Date(Date.now() - 10800000),
        details: 'Modification du profil utilisateur',
        page: '/profile'
      }
    ];

    this.activitiesSignal.set(mockActivities);
    this.activities$.next(mockActivities);
  }

  // Méthodes publiques
  getActivitiesSignal() {
    return this.activitiesSignal.asReadonly();
  }

  getActivitiesStream(): Observable<Activity[]> {
    return this.activities$.asObservable();
  }

  addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): void {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date()
    };

    const current = this.activitiesSignal();
    this.activitiesSignal.set([newActivity, ...current]);
    this.activities$.next([newActivity, ...current]);
  }

  setCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
  }

  getCurrentUser() {
    return this.currentUserSignal.asReadonly();
  }

  getActivitiesByRole(role: UserRole): Activity[] {
    // Simulation: filtrage selon le rôle
    const all = this.activitiesSignal();
    if (role === UserRole.ADMIN) {
      return all; // Admin voit tout
    } else if (role === UserRole.MANAGER) {
      return all.slice(0, 20); // Manager voit les 20 dernières
    } else {
      return all.filter(a => a.userId === this.currentUserSignal()?.id); // User voit seulement ses activités
    }
  }

}
