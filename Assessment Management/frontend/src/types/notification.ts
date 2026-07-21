export type NotificationStatus = 'Published'|'Scheduled'|'Draft'
export interface Notification { id:string; title:string; message:string; audience:'All Mentors'|'All Students'|'All Users'; status:NotificationStatus; scheduledAt:string; createdAt:string; sent:number }
