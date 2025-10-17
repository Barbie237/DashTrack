import { createAction, props } from '@ngrx/store';
import { Activity } from '../models/activity.model';

export const loadActivities = createAction(
  '[Tracking] Load Activities',
  props<{ activities: Activity[] }>()
);

export const addActivity = createAction(
  '[Tracking] Add Activity',
  props<{ activity: Activity }>()
);

export const clearActivities = createAction('[Tracking] Clear Activities');
