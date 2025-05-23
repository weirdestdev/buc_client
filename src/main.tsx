import React, { createContext } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import UserStore from "./store/UserStore";
import UserWorkStore from "./store/UserWorkStore";
import CategoriesStore from "./store/CategoriesStore";
import RentTimeStore from "./store/RentStore";
import DocsStore from "./store/DocsStore";
import MemberRequestsStore from "./store/MemberRequestsStore"; // импорт нового стора

export interface IRootStore {
  userStore: UserStore;
  userWorkStore: UserWorkStore;
  categoriesStore: CategoriesStore;
  rentTimeStore: RentTimeStore;
  docsStore: DocsStore;
  memberRequestsStore: MemberRequestsStore; // добавляем новый стор
}

const rootStore: IRootStore = {
  userStore: new UserStore(),
  userWorkStore: new UserWorkStore(),
  categoriesStore: new CategoriesStore(),
  rentTimeStore: new RentTimeStore(),
  docsStore: new DocsStore(),
  memberRequestsStore: new MemberRequestsStore(), // инициализируем новый стор
};

export const Context = createContext<IRootStore | null>(null);

createRoot(document.getElementById("root")!).render(
  <Context.Provider value={rootStore}>
    <App />
  </Context.Provider>
);
