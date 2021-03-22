import {getMockSearchActions, getMockStore} from "../../../mock-objects";
import {initialSearchState} from "../../../../src/features/search/search-slice";
import {AppState, AppStore} from "../../../../src/store/store";
import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {SearchActionsContext} from "../../../../src/features/search/search-actions-context";
import React from "react";
import SearchScreen from "../../../../src/features/search/ui/search-screen";
import {SearchError} from "../../../../src/features/search/types/search-error";
import User from "../../../../src/features/user/types/user";

const MockStore = getMockStore();
let mockSearchActions = getMockSearchActions();
let {searchForUsers} = mockSearchActions;

const renderComponent = (mockStore: AppStore) => {
  render(
    <Provider store={mockStore}>
      <SearchActionsContext.Provider value={mockSearchActions}>
        <SearchScreen/>
      </SearchActionsContext.Provider>
    </Provider>
  );
};
jest.mock(
  'react-virtualized-auto-sizer',
  () => ({children}: any) => children({height: 600, width: 600})
);

beforeEach(() => {
  mockSearchActions = getMockSearchActions();
  ({searchForUsers} = mockSearchActions);
});

it('should display an error if there was one', () => {
  // arrange
  const state = {
    search: {
      ...initialSearchState,
      error: SearchError.network,
    }
  } as AppState;
  const mockStore = MockStore(state);
  // render
  renderComponent(mockStore);
  // assert
  expect(screen.getByTestId('search-error')).toBeInTheDocument();
});

it('should display loading if it is loading', () => {
  // arrange
  const state = {
    search: {
      ...initialSearchState,
      loading: true,
    }
  } as AppState;
  const mockStore = MockStore(state);
  // render
  renderComponent(mockStore);
  // assert
  expect(screen.getByTestId('search-loading')).toBeInTheDocument();
});

it('should display results if there are any', async () => {
  // arrange
  const results: User[] = [
    {
      id: 'id1',
      username: 'username1',
      name: null,
      photo: null,
    },
    {
      id: 'id2',
      username: 'username2',
      name: null,
      photo: null,
    }
  ];
  const state = {
    search: {
      ...initialSearchState,
      results,
    }
  } as AppState;
  const mockStore = MockStore(state);
  // render
  renderComponent(mockStore);
  // assert
  expect(await screen.findAllByTestId('search-result-item'))
    .toHaveLength(results.length);
});