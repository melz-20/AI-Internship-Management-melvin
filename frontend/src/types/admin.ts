export interface DashboardMetrics { totalMentors:number; totalStudents:number; activeMentors:number; todayLogins:number; pendingApprovals:number; averageProgress:number }
export interface Activity { id:string; actor:string; action:string; detail:string; time:string; type:'mentor'|'admin'|'system' }
export interface ChartPoint { name:string; value:number; secondary?:number }
