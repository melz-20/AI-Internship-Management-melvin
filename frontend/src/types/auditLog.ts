export interface AuditLog { id:string; actor:string; actorType:'Admin'|'Mentor'|'System'; action:string; details:string; timestamp:string; ipAddress:string }
