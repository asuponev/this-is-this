import { AppRoute, AppRoutesPath } from './types';

import MainPage from '../pages/main-page/main-page';
import LoginPage from '../pages/login-page/login-page';
import SignupPage from '../pages/signup-page/signup-page';
import NotFoundPage from '../pages/not-found-page/not-found-page';

export const NOT_FOUND_COMPONENT: AppRoute = {
  path: AppRoutesPath.NOT_FOUND,
  component: new NotFoundPage().getElement(),
};

export const ROUTES: AppRoute[] = [
  {
    path: AppRoutesPath.MAIN,
    component: new MainPage().getElement(),
  },
  {
    path: AppRoutesPath.LOGIN,
    component: new LoginPage().getElement(),
  },
  {
    path: AppRoutesPath.SIGN_UP,
    component: new SignupPage().getElement(),
  },
  NOT_FOUND_COMPONENT,
];