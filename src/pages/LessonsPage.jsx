import React from 'react';
import ModuleCrudPage from '../components/ModuleCrudPage';
import { useAuth } from '../hooks/useAuth';
export default function LessonsPage(){ const {role}=useAuth(); return <ModuleCrudPage title="Lessons" endpoint="/lessons" fields={['courseId','title','type','parentId','content']} canWrite={['admin','teacher'].includes(role)} />; }
