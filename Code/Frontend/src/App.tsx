import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import PipelinePage from './pages/PipelinePage'
import IdeasPage from './pages/IdeasPage'
import ExperimentsPage from './pages/ExperimentsPage'
import PapersPage from './pages/PapersPage'
import ReviewsPage from './pages/ReviewsPage'

function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/ideas" element={<IdeasPage />} />
        <Route path="/experiments" element={<ExperimentsPage />} />
        <Route path="/papers" element={<PapersPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
      </Route>
    </Routes>
  )
}

export default App
