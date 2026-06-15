/**
 * Re-export ThoughtRecord types from central index.
 * Kept for backward-compat — direct imports from this path still work.
 */
export type {
  ThoughtRecord,
  ThoughtRecordCreate,
  AIReframe,
} from './index';

// Legacy aliases used in older components
export type ThoughtRecordUpdate = import('./index').ThoughtRecordCreate;
