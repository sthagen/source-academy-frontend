import { Router } from 'src/commons/application/types/CommonsTypes';
import { createActions } from 'src/commons/redux/utils';

const CommonsActions = createActions('commons', {
  logOut: () => ({}),
  updateReactRouter: (updatedRouter: Router) => updatedRouter
});

// For compatibility with existing code (reducer)
export const { logOut, updateReactRouter } = CommonsActions;

// For compatibility with existing code (actions helper)
export default CommonsActions;
