import { dashboardMetrics,recentActivity,monthlyLogins,departmentStats } from '../mock/data/seed';import { mockRequest } from '../mock/mockApi';
export const dashboardApi={metrics:()=>mockRequest(dashboardMetrics),activity:()=>mockRequest(recentActivity),logins:()=>mockRequest(monthlyLogins),departments:()=>mockRequest(departmentStats)}
