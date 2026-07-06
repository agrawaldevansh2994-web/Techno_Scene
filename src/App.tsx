import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CalendarView from './pages/CalendarView';
import EventDetailsView from './pages/EventDetailsView';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen" style={{ background: '#030303', color: '#f1f1f1' }}>
        {/* Ambient animated background */}
        <div className="ambient-bg" />
        
        {/* Content layer */}
        <div className="relative z-10">
          <Header />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <Routes>
              <Route path="/" element={<CalendarView />} />
              <Route path="/event/:id" element={<EventDetailsView />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
