export type MentorStatus = 'ACTIVE'|'INACTIVE'|'PENDING'|'REJECTED'
export interface Mentor { id:string; name:string; email:string; phone:string; department:string; expertise:string; students:number; status:MentorStatus; joinedAt:string; lastLogin:string; attendance:number; performance:number; avatar:string }
export interface StudentAssignment { id:string; name:string; department:string; internshipStatus:string; assigned:boolean }
