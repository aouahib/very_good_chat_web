import React from 'react';
import {
  getMockStore,
  getMockUserActions,
  loggedInAuthState,
  mockUser,
  mockUserActionObjects
} from "../../../mock-objects";
import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {AppState, AppStore} from "../../../../src/store/store";
import LoggedInScreen from "../../../../src/features/user/ui/logged-in-screen";
import {UserActionsContext} from "../../../../src/features/user/user-actions-context";
import {UserState} from "../../../../src/features/user/user-slice";
import UserError from "../../../../src/features/user/types/user-error";

const mockUserActions = getMockUserActions();
const MockStore = getMockStore();

const initialUserState: UserState = {
  initialized: false,
  currentUser: null,
  creatingUser: false,
  error: null,
};
const initialState = {
  user: initialUserState,
  auth: loggedInAuthState,
} as AppState;

const renderComponent = (mockStore: AppStore) => {
  render(
    <Provider store={mockStore}>
      <UserActionsContext.Provider value={mockUserActions}>
        <LoggedInScreen/>
      </UserActionsContext.Provider>
    </Provider>
  );
};

test('Should dispatch getCurrentUser on render', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  expect(mockUserActions.getCurrentUser).toBeCalledTimes(1);
  expect(mockStore.getActions()).toContain(mockUserActionObjects.getCurrentUser);
});

test('Should display a loader if the state is being initialized', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument();
  expect(screen.queryByTestId('retry-button')).toBeNull();
  expect(screen.queryByTestId('registration-screen')).toBeNull();
  expect(screen.queryByTestId('main-screen')).toBeNull();
});

test('Should display a retry button if there was an initialization error', () => {
  // arrange
  const errorState: AppState = {
    ...initialState,
    user: {...initialUserState, error: UserError.network},
  };
  const mockStore = MockStore(errorState);
  // act
  renderComponent(mockStore);
  // assert
  expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
  expect(screen.queryByTestId('registration-screen')).toBeNull();
  expect(screen.queryByTestId('main-screen')).toBeNull();
});

test(
  'Should display the registration screen if the state was initialized, ' +
  'but no user was logged in',
  () => {
    // arrange
    const registrationState: AppState = {
      ...initialState,
      user: {...initialUserState, initialized: true},
    };
    const mockStore = MockStore(registrationState);
    // act
    renderComponent(mockStore);
    // assert
    expect(screen.getByTestId('registration-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('main-screen')).toBeNull();
    expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
    expect(screen.queryByTestId('retry-button')).toBeNull();
  },
);

test(
  'Should display the main screen if the state was initialized, ' +
  'and a user was logged in',
  () => {
    // arrange
    const registrationState: AppState = {
      ...initialState,
      user: {...initialUserState, initialized: true, currentUser: mockUser},
    };
    const mockStore = MockStore(registrationState);
    // act
    renderComponent(mockStore);
    // assert
    expect(screen.getByTestId('main-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('registration-screen')).toBeNull();
    expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
    expect(screen.queryByTestId('retry-button')).toBeNull();
  },
);