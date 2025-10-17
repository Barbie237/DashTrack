import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TrackingState } from './tracking.reducer';

export const selectTrackingState = createFeatureSelector<TrackingState>('tracking');

export const selectActivities = createSelector(
  selectTrackingState,
  (state) => state.activities
);
