import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return user.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />;
};

export default Dashboard;
