// src/app/components/tracking/tracking.component.ts
import { Component, OnInit, OnDestroy, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingService } from '../../services/tracking.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.css'
})
export class TrackingComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly trackingService = inject(TrackingService)

  // Utilisation des signals du service
  activities = this.trackingService.getActivitiesSignal();
  totalActivities = this.trackingService.totalActivities;

  // Computed signals locaux
  recentCount = computed(() =>
    this.activities().filter(a =>
      Date.now() - a.timestamp.getTime() < 300000
    ).length
  );

  activeUsers = computed(() => {
    const recent = this.activities().filter(a =>
      Date.now() - a.timestamp.getTime() < 300000
    );
    return new Set(recent.map(a => a.userId)).size;
  });

  constructor() {
    // Effect pour réagir aux changements
    effect(() => {
      const total = this.totalActivities();
      if (total > 0 && total % 10 === 0) {
        console.log(`Milestone atteint: ${total} activités`);
      }
    });
  }

  ngOnInit(): void {
    // Combinaison RxJS + Signals
    this.trackingService.getActivitiesStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe(activities => {
        console.log('Stream update:', activities.length);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  getActionBadgeClass(action: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    const actionClasses = {
      'LOGIN': 'bg-green-500/20 text-green-300 border border-green-500/30',
      'LOGOUT': 'bg-red-500/20 text-red-300 border border-red-500/30',
      'VIEW_PAGE': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      'UPDATE_PROFILE': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      'DELETE_ITEM': 'bg-red-600/20 text-red-400 border border-red-600/30',
      'CREATE_ITEM': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    };
    return `${baseClasses} ${actionClasses[action as keyof typeof actionClasses] || 'bg-slate-500/20 text-slate-300'}`;
  }

  simulateActivity(): void {
    const actions = ['VIEW_PAGE', 'UPDATE_PROFILE', 'CREATE_ITEM'];
    const pages = ['/dashboard', '/profile', '/settings'];

    this.trackingService.addActivity({
      userId: `user-${Math.floor(Math.random() * 5) + 1}`,
      action: actions[Math.floor(Math.random() * actions.length)],
      details: 'Action simulée manuellement',
      page: pages[Math.floor(Math.random() * pages.length)],
      duration: Math.floor(Math.random() * 60) + 10
    });
  }
}
