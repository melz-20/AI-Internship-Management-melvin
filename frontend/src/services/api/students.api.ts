import { students } from '../mock/data/seed'; import { mockRequest } from '../mock/mockApi';
export const studentsApi={list:()=>mockRequest(students),get:(id:string)=>mockRequest(students.find(x=>x.id===id)!)}
