import {
  combineReducers,
  configureStore,
  getDefaultMiddleware
} from "@reduxjs/toolkit";
import authReducer from '../features/auth/auth-slice';
import userReducer from '../features/user/user-slice';
import searchReducer from '../features/search/search-slice';
import friendProfileReducer from '../features/friend/friend-profile-slice';
import friendsReducer from '../features/friend/friends-slice';
import badgeReducer from '../features/badge/badge-slice';

import StoreExtraArg from "./store-extra-arg";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  search: searchReducer,
  friendProfile: friendProfileReducer,
  friends: friendsReducer,
  badge: badgeReducer
});

const createStore = (services: StoreExtraArg) => {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware({
      thunk: {extraArgument: services}
    })
  });
};

export type AppStore = ReturnType<typeof createStore>;

export type AppState = ReturnType<typeof rootReducer>;

export type AppDispatch = AppStore['dispatch'];

export type ThunkAPI<RejectType> = {
  dispatch: AppDispatch,
  state: AppState,
  extra: StoreExtraArg,
  rejectValue: RejectType,
};

export default createStore;

