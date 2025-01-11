import './App.css';
import Navbar from './Components/Navbar';
import SignIn from './Components/SignIn';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import TaskList from './Components/TaskList';
import Context from './Context/Context';
import AllEvents from './Components/events/allEvents';
import AddEditEvent from './Components/events/addEditEvent';
import Attendees from './Components/Attendees';

function App() {
  return (
    <Context>
      <div className="App">
        <>
          <Navbar />
          <Routes>
            {/* Default route */}
            <Route path="/" element={<SignIn type="signin" />} />
            {/* Routes for other paths */}
            <Route path="/tasklist/:event_id" element={<TaskList />} />
            <Route path="/signup" element={<SignIn type="signup" />} />
            <Route path="/events" element={<AllEvents />} />
            {/* Wildcard route */}
            <Route path="/*" element={<SignIn type="signin" />} />
            <Route path='/events/add-edit-event/:id' exact element={<AddEditEvent/>} />
            <Route path='/attendees/:task_id' exact element={<Attendees/>} />
          </Routes>
        </>
      </div>
    </Context>
  );
}

export default App;
