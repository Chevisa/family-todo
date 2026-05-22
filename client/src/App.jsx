import { RouterProvider } from "react-router-dom";
import { router } from './routes.jsx';

// TODO: убрать шаблон Vite использовать RouterProvider и router

function App() {
  return <RouterProvider router={router} />
}

export default App
