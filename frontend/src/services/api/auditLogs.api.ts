import { auditLogs } from '../mock/data/seed';import { mockRequest } from '../mock/mockApi';export const auditLogsApi={list:()=>mockRequest(auditLogs)}
