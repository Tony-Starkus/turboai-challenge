import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Session } from '@/lib/api';

export type AuthStatus = 'booting' | 'ready';

type AuthState = {
  session: Session | null;
  status: AuthStatus;
};

const initialState: AuthState = {
  session: null,
  status: 'booting',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    finishBoot(state) {
      state.status = 'ready';
    },
    setSession(state, action: PayloadAction<Session>) {
      state.session = action.payload;
      state.status = 'ready';
    },
    clearSession(state) {
      state.session = null;
      state.status = 'ready';
    },
  },
});

export const { clearSession, finishBoot, setSession } = authSlice.actions;

export default authSlice.reducer;

export const getAuthSession = (state: { auth: AuthState }) => state.auth.session;
export const getAuthStatus = (state: { auth: AuthState }) => state.auth.status;
