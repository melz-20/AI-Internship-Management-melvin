import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './app/router/AppRouter'
import { AppProviders } from './app/providers/AppProviders'

export default function App() {
  return <BrowserRouter><AppProviders><AppRouter /></AppProviders></BrowserRouter>
}
