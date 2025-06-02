import { Routes, Route } from 'react-router-dom';
import EmployeeManagement from './pages/Employee';
import TaskManagement from './pages/TaskManagement';
import MessageBox from './pages/MessageBox';
import SideMenu from './layout/SideMenu';

const App = () => {
  return (
    <div className="flex">
      
      <SideMenu />
      <div className="flex-1">
        <Routes>
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/manage-task" element={<TaskManagement />} />
          <Route path="/message" element={<MessageBox />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;