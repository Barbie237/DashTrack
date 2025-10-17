import { createReducer, on } from '@ngrx/store';
import { loadActivities, addActivity, clearActivities } from './tracking.actions';
import { Activity } from '../models/activity.model';

export interface TrackingState {
  activities: Activity[];
}

export const initialState: TrackingState = {
  activities: []
};

export const trackingReducer = createReducer(
  initialState,
  on(loadActivities, (state, { activities }) => ({ ...state, activities })),
  on(addActivity, (state, { activity }) => ({ ...state, activities: [activity, ...state.activities] })),
  on(clearActivities, (state) => ({ ...state, activities: [] }))
);
