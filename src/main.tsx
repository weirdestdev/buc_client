import React, { createContext } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import UserStore from "./store/UserStore";
import UserWorkStore from "./store/UserWorkStore";
import CategoriesStore from "./store/CategoriesStore"; // импортируем CategoriesStore

export interface IRootStore {
  userStore: UserStore;
  userWorkStore: UserWorkStore;
  categoriesStore: CategoriesStore;
}

const rootStore: IRootStore = {
  userStore: new UserStore(),
  userWorkStore: new UserWorkStore(),
  categoriesStore: new CategoriesStore(),
};

export const Context = createContext<IRootStore | null>(null);

createRoot(document.getElementById("root")!).render(
  <Context.Provider value={rootStore}>
    <App />
  </Context.Provider>
);
