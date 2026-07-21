import type { Mentor } from '../../../types/mentor'
import type { Student } from '../../../types/student'
import type { DashboardMetrics, Activity, ChartPoint } from '../../../types/admin'
import type { Notification } from '../../../types/notification'
import type { AuditLog } from '../../../types/auditLog'
import type { AdminProfile, AppSettings } from '../../../types/settings'

export const mentors: Mentor[] = [
 {id:'m1',name:'Dr. Priya Sharma',email:'priya.sharma@college.edu',phone:'+91 98765 43210',department:'Computer Science',expertise:'Machine Learning',students:12,status:'ACTIVE',joinedAt:'12 Jan 2026',lastLogin:'Today, 09:42 AM',attendance:96,performance:94,avatar:'PS'},
 {id:'m2',name:'Arjun Mehta',email:'arjun.mehta@college.edu',phone:'+91 98765 12345',department:'Information Technology',expertise:'Cloud Computing',students:10,status:'ACTIVE',joinedAt:'18 Feb 2026',lastLogin:'Today, 08:18 AM',attendance:93,performance:89,avatar:'AM'},
 {id:'m3',name:'Nisha Reddy',email:'nisha.reddy@college.edu',phone:'+91 99887 66554',department:'Computer Science',expertise:'Data Science',students:9,status:'PENDING',joinedAt:'02 Jul 2026',lastLogin:'Never',attendance:0,performance:0,avatar:'NR'},
 {id:'m4',name:'Vikram Singh',email:'vikram.singh@college.edu',phone:'+91 98111 22334',department:'Electronics',expertise:'Embedded AI',students:8,status:'INACTIVE',joinedAt:'21 Mar 2026',lastLogin:'08 Jul 2026',attendance:81,performance:75,avatar:'VS'},
 {id:'m5',name:'Kavya Iyer',email:'kavya.iyer@college.edu',phone:'+91 98222 11223',department:'Information Technology',expertise:'Product Design',students:11,status:'ACTIVE',joinedAt:'05 Apr 2026',lastLogin:'Yesterday, 05:20 PM',attendance:98,performance:96,avatar:'KI'},
 {id:'m6',name:'Rahul Nair',email:'rahul.nair@college.edu',phone:'+91 99000 33221',department:'Computer Science',expertise:'Cyber Security',students:7,status:'ACTIVE',joinedAt:'09 May 2026',lastLogin:'Yesterday, 11:41 AM',attendance:90,performance:86,avatar:'RN'},
]
export const students: Student[] = [
 {id:'s1',name:'Aarav Patel',email:'aarav.patel@college.edu',department:'Computer Science',mentor:'Dr. Priya Sharma',mentorId:'m1',internshipStatus:'In Progress',progress:78,attendance:94,performance:88,reportStatus:'Submitted',avatar:'AP'},
 {id:'s2',name:'Diya Kapoor',email:'diya.kapoor@college.edu',department:'Information Technology',mentor:'Arjun Mehta',mentorId:'m2',internshipStatus:'In Progress',progress:65,attendance:90,performance:85,reportStatus:'Pending',avatar:'DK'},
 {id:'s3',name:'Rohan Verma',email:'rohan.verma@college.edu',department:'Computer Science',mentor:'Kavya Iyer',mentorId:'m5',internshipStatus:'Completed',progress:100,attendance:98,performance:95,reportStatus:'Approved',avatar:'RV'},
 {id:'s4',name:'Ananya Das',email:'ananya.das@college.edu',department:'Electronics',mentor:'Vikram Singh',mentorId:'m4',internshipStatus:'At Risk',progress:42,attendance:71,performance:61,reportStatus:'Pending',avatar:'AD'},
 {id:'s5',name:'Ishaan Gupta',email:'ishaan.gupta@college.edu',department:'Information Technology',mentor:'Arjun Mehta',mentorId:'m2',internshipStatus:'Not Started',progress:8,attendance:100,performance:0,reportStatus:'Not Due',avatar:'IG'},
 {id:'s6',name:'Meera Joshi',email:'meera.joshi@college.edu',department:'Computer Science',mentor:'Dr. Priya Sharma',mentorId:'m1',internshipStatus:'In Progress',progress:72,attendance:96,performance:91,reportStatus:'Submitted',avatar:'MJ'},
]
export const dashboardMetrics:DashboardMetrics={totalMentors:48,totalStudents:386,activeMentors:42,todayLogins:31,pendingApprovals:4,averageProgress:68}
export const recentActivity:Activity[]=[{id:'a1',actor:'Dr. Priya Sharma',action:'Logged in',detail:'Accessed mentor workspace',time:'8 min ago',type:'mentor'},{id:'a2',actor:'Nisha Reddy',action:'Registration submitted',detail:'Awaiting administrator approval',time:'32 min ago',type:'mentor'},{id:'a3',actor:'Admin',action:'Notification published',detail:'July internship guidelines',time:'1 hr ago',type:'admin'},{id:'a4',actor:'Arjun Mehta',action:'Updated attendance',detail:'Weekly attendance summary',time:'2 hrs ago',type:'mentor'}]
export const monthlyLogins:ChartPoint[]=[{name:'Jan',value:120},{name:'Feb',value:178},{name:'Mar',value:159},{name:'Apr',value:220},{name:'May',value:246},{name:'Jun',value:231},{name:'Jul',value:289}]
export const departmentStats:ChartPoint[]=[{name:'CSE',value:156,secondary:18},{name:'IT',value:104,secondary:14},{name:'ECE',value:72,secondary:9},{name:'EEE',value:54,secondary:7}]
export const notifications:Notification[]=[{id:'n1',title:'July internship guidelines',message:'Please review the updated internship guidelines and weekly reporting dates.',audience:'All Mentors',status:'Published',scheduledAt:'12 Jul 2026, 10:30 AM',createdAt:'12 Jul 2026',sent:48},{id:'n2',title:'Progress report reminder',message:'Submit your progress report before the deadline.',audience:'All Students',status:'Scheduled',scheduledAt:'15 Jul 2026, 09:00 AM',createdAt:'11 Jul 2026',sent:0},{id:'n3',title:'System maintenance',message:'The portal will be unavailable briefly this weekend.',audience:'All Users',status:'Draft',scheduledAt:'',createdAt:'10 Jul 2026',sent:0}]
export const auditLogs:AuditLog[]=[{id:'l1',actor:'Admin',actorType:'Admin',action:'Approved mentor registration',details:'Approved Nisha Reddy',timestamp:'12 Jul 2026, 10:12 AM',ipAddress:'103.24.12.8'},{id:'l2',actor:'Dr. Priya Sharma',actorType:'Mentor',action:'Logged in',details:'Successful sign in',timestamp:'12 Jul 2026, 09:42 AM',ipAddress:'103.24.18.52'},{id:'l3',actor:'Admin',actorType:'Admin',action:'Password reset initiated',details:'Reset link sent to Vikram Singh',timestamp:'11 Jul 2026, 04:36 PM',ipAddress:'103.24.12.8'},{id:'l4',actor:'Arjun Mehta',actorType:'Mentor',action:'Updated profile',details:'Updated phone number',timestamp:'11 Jul 2026, 11:28 AM',ipAddress:'103.24.67.20'}]
export const adminProfile:AdminProfile={name:'Melvin',email:'melvinanto@college.edu',phone:'+91 98765 40122',role:'System Administrator',department:'Internship Cell',avatar:'AR'}
export const defaultSettings:AppSettings={theme:'light',emailNotifications:true,loginAlerts:true,weeklySummary:true,twoFactorAuth:false}
export const appSettings:AppSettings=defaultSettings
