import React from 'react';
import ModuleCrudPage from '../components/ModuleCrudPage';
import { useAuth } from '../hooks/useAuth';
export default function GroupsPage(){ const {role}=useAuth(); return <ModuleCrudPage title="Groups" endpoint="/groups" fields={['courseId','name','userIds']} canWrite={['admin','teacher'].includes(role)} />; }
