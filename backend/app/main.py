from uuid import uuid4
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from . import store
from .schemas import MentorCreate, MentorUpdate, NotificationCreate, Settings, AdminProfile, PasswordChange

app=FastAPI(title='AI Internship Management — Admin API',version='1.0.0',openapi_url='/api/v1/openapi.json')
app.add_middleware(CORSMiddleware,allow_origins=['http://localhost:5173','http://127.0.0.1:5173'],allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
PREFIX='/api/v1/admin'
def find(items,id):
    row=next((x for x in items if x['id']==id),None)
    if not row: raise HTTPException(404,'Record not found')
    return row
@app.get('/health')
def health(): return {'status':'ok','service':'admin-api'}
@app.get(f'{PREFIX}/dashboard')
def dashboard(): return {'metrics':{'totalMentors':len(store.MENTORS),'totalStudents':386,'activeMentors':sum(x['status']=='ACTIVE' for x in store.MENTORS),'todayLogins':31,'pendingApprovals':sum(x['status']=='PENDING' for x in store.MENTORS),'averageProgress':68},'monthlyLogins':[{'name':x,'value':v} for x,v in [('Jan',120),('Feb',178),('Mar',159),('Apr',220),('May',246),('Jun',231),('Jul',289)]],'activities':store.AUDIT_LOGS}
@app.get(f'{PREFIX}/mentors')
def mentors(page:int=1,limit:int=20,search:str='',status:str|None=None):
    rows=[m for m in store.MENTORS if search.lower() in f"{m['name']} {m['email']} {m['department']}".lower() and (not status or m['status']==status)]
    return store.page(rows,page,limit)
@app.post(f'{PREFIX}/mentors',status_code=201)
def create_mentor(payload:MentorCreate):
    if any(x['email']==str(payload.email) for x in store.MENTORS): raise HTTPException(409,'A mentor with this email already exists')
    row={'id':f'm{uuid4().hex[:8]}',**payload.model_dump(),'students':0,'status':'PENDING','joinedAt':'Today','lastLogin':'Never','attendance':0,'performance':0,'avatar':''.join(p[0] for p in payload.name.split()[:2]).upper()};store.MENTORS.append(row);return row
@app.get(f'{PREFIX}/mentors/{{mentor_id}}')
def mentor(mentor_id:str): return find(store.MENTORS,mentor_id)
@app.put(f'{PREFIX}/mentors/{{mentor_id}}')
def update_mentor(mentor_id:str,payload:MentorUpdate):
    row=find(store.MENTORS,mentor_id); row.update(payload.model_dump(exclude_none=True)); return row
@app.patch(f'{PREFIX}/mentors/{{mentor_id}}/status')
def mentor_status(mentor_id:str,status:str):
    row=find(store.MENTORS,mentor_id)
    if status not in {'ACTIVE','INACTIVE','PENDING','REJECTED'}: raise HTTPException(422,'Invalid status')
    row['status']=status; return row
@app.delete(f'{PREFIX}/mentors/{{mentor_id}}',status_code=204)
def delete_mentor(mentor_id:str): store.MENTORS.remove(find(store.MENTORS,mentor_id))
@app.get(f'{PREFIX}/students')
def students(page:int=1,limit:int=20,search:str=''): return store.page([x for x in store.STUDENTS if search.lower() in str(x).lower()],page,limit)
@app.get(f'{PREFIX}/students/{{student_id}}')
def student(student_id:str): return find(store.STUDENTS,student_id)
@app.get(f'{PREFIX}/analytics')
def analytics(): return {'departments':[{'name':'CSE','value':156,'secondary':18},{'name':'IT','value':104,'secondary':14},{'name':'ECE','value':72,'secondary':9}],'completionRate':72,'successRate':89,'attendanceRate':92,'performanceAverage':88}
@app.get(f'{PREFIX}/notifications')
def notifications(): return store.NOTIFICATIONS
@app.post(f'{PREFIX}/notifications',status_code=201)
def create_notification(payload:NotificationCreate):
    scheduled=bool(payload.scheduled_at); row={'id':f'n{uuid4().hex[:8]}','title':payload.title,'message':payload.message,'audience':payload.audience,'status':'Scheduled' if scheduled else 'Published','scheduledAt':payload.scheduled_at or 'Now','createdAt':'Today','sent':0 if scheduled else (len(store.MENTORS) if payload.audience=='All Mentors' else len(store.STUDENTS))};store.NOTIFICATIONS.insert(0,row);return row
@app.delete(f'{PREFIX}/notifications/{{notification_id}}',status_code=204)
def delete_notification(notification_id:str): store.NOTIFICATIONS.remove(find(store.NOTIFICATIONS,notification_id))
@app.get(f'{PREFIX}/audit-logs')
def audit_logs(search:str=''): return [x for x in store.AUDIT_LOGS if search.lower() in str(x).lower()]
@app.get(f'{PREFIX}/settings')
def get_settings(): return store.SETTINGS
@app.put(f'{PREFIX}/settings')
def update_settings(payload:Settings): store.SETTINGS.update(payload.model_dump(by_alias=True));return store.SETTINGS
@app.get(f'{PREFIX}/profile')
def profile(): return store.PROFILE
@app.put(f'{PREFIX}/profile')
def update_profile(payload:AdminProfile): store.PROFILE.update(payload.model_dump());return store.PROFILE
@app.post(f'{PREFIX}/profile/change-password')
def change_password(payload:PasswordChange): return {'message':'Password updated successfully'}
