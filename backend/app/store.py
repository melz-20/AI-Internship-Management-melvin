from copy import deepcopy
from .schemas import Mentor, Student, Settings, AdminProfile

MENTORS = [
 {'id':'m1','name':'Dr. Priya Sharma','email':'priya.sharma@college.edu','phone':'+91 98765 43210','department':'Computer Science','expertise':'Machine Learning','students':12,'status':'ACTIVE','joinedAt':'12 Jan 2026','lastLogin':'Today, 09:42 AM','attendance':96,'performance':94,'avatar':'PS'},
 {'id':'m2','name':'Arjun Mehta','email':'arjun.mehta@college.edu','phone':'+91 98765 12345','department':'Information Technology','expertise':'Cloud Computing','students':10,'status':'ACTIVE','joinedAt':'18 Feb 2026','lastLogin':'Today, 08:18 AM','attendance':93,'performance':89,'avatar':'AM'},
 {'id':'m3','name':'Nisha Reddy','email':'nisha.reddy@college.edu','phone':'+91 99887 66554','department':'Computer Science','expertise':'Data Science','students':9,'status':'PENDING','joinedAt':'02 Jul 2026','lastLogin':'Never','attendance':0,'performance':0,'avatar':'NR'},
 {'id':'m4','name':'Vikram Singh','email':'vikram.singh@college.edu','phone':'+91 98111 22334','department':'Electronics','expertise':'Embedded AI','students':8,'status':'INACTIVE','joinedAt':'21 Mar 2026','lastLogin':'08 Jul 2026','attendance':81,'performance':75,'avatar':'VS'}]
STUDENTS = [
 {'id':'s1','name':'Aarav Patel','email':'aarav.patel@college.edu','department':'Computer Science','mentor':'Dr. Priya Sharma','mentorId':'m1','internshipStatus':'In Progress','progress':78,'attendance':94,'performance':88,'reportStatus':'Submitted','avatar':'AP'},
 {'id':'s2','name':'Diya Kapoor','email':'diya.kapoor@college.edu','department':'Information Technology','mentor':'Arjun Mehta','mentorId':'m2','internshipStatus':'In Progress','progress':65,'attendance':90,'performance':85,'reportStatus':'Pending','avatar':'DK'},
 {'id':'s3','name':'Rohan Verma','email':'rohan.verma@college.edu','department':'Computer Science','mentor':'Dr. Priya Sharma','mentorId':'m1','internshipStatus':'Completed','progress':100,'attendance':98,'performance':95,'reportStatus':'Approved','avatar':'RV'}]
NOTIFICATIONS = [{'id':'n1','title':'July internship guidelines','message':'Please review the updated internship guidelines.','audience':'All Mentors','status':'Published','scheduledAt':'12 Jul 2026, 10:30 AM','createdAt':'12 Jul 2026','sent':48}]
AUDIT_LOGS = [{'id':'l1','actor':'Admin','actorType':'Admin','action':'Approved mentor registration','details':'Approved Nisha Reddy','timestamp':'12 Jul 2026, 10:12 AM','ipAddress':'103.24.12.8','status':'Success'}, {'id':'l2','actor':'Dr. Priya Sharma','actorType':'Mentor','action':'Logged in','details':'Successful sign in','timestamp':'12 Jul 2026, 09:42 AM','ipAddress':'103.24.18.52','status':'Success'}]
SETTINGS = {'theme':'light','emailNotifications':True,'loginAlerts':True,'weeklySummary':True,'twoFactorAuth':False}
PROFILE = {'name':'Melvin','email':'melvinanto@college.edu','phone':'+91 98765 40122','role':'System Administrator','department':'Internship Cell','avatar':'AR'}
def page(items, page_no=1, limit=20):
    total=len(items); start=(page_no-1)*limit
    return {'data':deepcopy(items[start:start+limit]),'total':total,'page':page_no,'limit':limit,'totalPages':max(1,(total+limit-1)//limit)}
