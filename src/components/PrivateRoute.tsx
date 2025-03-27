// PrivateRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
// Импортируем контекст, в котором хранится корневой стор
import { Context } from '../main'; // проверьте корректность пути
import { observer } from 'mobx-react-lite';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = observer(({ children }) => {
  // Получаем userStore из контекста
  const rootStore = useContext(Context);
  
  return children;
});

export default PrivateRoute;
