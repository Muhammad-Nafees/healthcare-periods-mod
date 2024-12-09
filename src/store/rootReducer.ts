import {combineReducers} from '@reduxjs/toolkit';
import {userData} from './slices/User';
import {MedicationData} from './slices/MedicationSlice';
import {markerData} from './slices/MarkersSlice';
import {PeriodTracker} from './slices/periodTracker';

const rootReducers = combineReducers({
  userData: userData,
  MedicationData: MedicationData,
  markers: markerData,
  PeriodTracker: PeriodTracker,
});

export default rootReducers;
