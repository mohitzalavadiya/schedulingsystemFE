import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AvailabilityPage from './components/AvailabilityPage.jsx';
import BookingPage from './components/BookingPage.jsx';
import NotFound from './components/NotFound.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AvailabilityPage />} />
        <Route path="/book/:linkId" element={<BookingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App
