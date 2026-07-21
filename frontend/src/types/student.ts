export type InternshipStatus = 'In Progress'|'Completed'|'Not Started'|'At Risk'
export interface Student { id:string; name:string; email:string; department:string; mentor:string; mentorId:string; internshipStatus:InternshipStatus; progress:number; attendance:number; performance:number; reportStatus:string; avatar:string }
