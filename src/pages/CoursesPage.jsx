import React from 'react';
import ModuleCrudPage from '../components/ModuleCrudPage';
import { useAuth } from '../hooks/useAuth';
export default function CoursesPage(){ const {role}=useAuth(); return <ModuleCrudPage title="Courses" endpoint="/courses" fields={['title','description','teacherId']} canWrite={['admin','teacher'].includes(role)} />; }
