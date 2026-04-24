import React from 'react';
import ModuleCrudPage from '../components/ModuleCrudPage';
import { useAuth } from '../hooks/useAuth';
export default function UsersPage(){ const {role}=useAuth(); return <ModuleCrudPage title="Users" endpoint="/users" fields={['name','email','password','role']} canWrite={role==='admin'} />; }
