export interface AdminProfile { name:string; email:string; phone:string; role:string; department:string; avatar:string }
export interface AppSettings { theme:'light'|'dark'|'system'; emailNotifications:boolean; loginAlerts:boolean; weeklySummary:boolean; twoFactorAuth:boolean }
