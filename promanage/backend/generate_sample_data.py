"""
generate_sample_data.py
------------------------
Creates sample_data.xlsx - a realistic dataset matching the columns the
/api/upload endpoint expects, so you can test the full upload -> dashboard
flow immediately without needing real company data.

Run with:
    python generate_sample_data.py

This writes sample_data.xlsx into the current folder. Drag it onto the
ProManage upload zone in the browser to populate the dashboard.
"""
import random
from datetime import date, timedelta

import pandas as pd

random.seed(42)

FIRST_NAMES = ["Arjun", "Priya", "Sara", "Meera", "Rohan", "Kabir", "Anya", "Vikram", "Neha", "Dev", "Ishaan", "Tara"]
LAST_NAMES = ["Kumar", "Sharma", "Lee", "Iyer", "Verma", "Singh", "Patel", "Rao", "Nair", "Gupta"]
ROLES = ["Frontend Developer", "Backend Developer", "Data Analyst", "QA Engineer", "UI/UX Designer", "Project Lead"]

PROJECT_NAMES = [
    "Chatbot POC", "Data Pipeline Revamp", "UI Design System", "Customer Portal",
    "Mobile App MVP", "Analytics Dashboard", "API Gateway Migration", "Internal Tools Suite",
    "Recommendation Engine", "Payment Integration", "Onboarding Flow Redesign", "Search Optimization",
]

STATUSES = ["active", "active", "active", "completed", "completed", "dropped"]

def random_date(start, end):
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, max(delta, 1)))

rows = []
today = date.today()
employees = [f"{f} {l}" for f, l in zip(
    random.sample(FIRST_NAMES, len(FIRST_NAMES)),
    random.sample(LAST_NAMES, len(LAST_NAMES)),
)]

# Reserve a few employees to remain fully unassigned, to demo that panel
unassigned_pool = employees[-3:]
assignable_pool = employees[:-3]

for i, proj_name in enumerate(PROJECT_NAMES):
    start = random_date(today - timedelta(days=90), today - timedelta(days=5))
    planned_deadline = start + timedelta(days=random.randint(20, 60))
    status = random.choice(STATUSES)

    actual_completion = None
    if status == "completed":
        # Randomly finish either a bit early or a bit late
        offset = random.randint(-10, 6)
        actual_completion = planned_deadline + timedelta(days=offset)

    progress = 100 if status == "completed" else (0 if status == "dropped" else random.randint(10, 90))
    team_size = random.randint(1, 3)
    team = random.sample(assignable_pool, k=min(team_size, len(assignable_pool)))

    for emp_name in team:
        rows.append({
            "Project Name": proj_name,
            "Start Date": start.isoformat(),
            "Deadline": planned_deadline.isoformat(),
            "Actual Completion Date": actual_completion.isoformat() if actual_completion else "",
            "Status": status,
            "Progress %": progress,
            "Employee Name": emp_name,
            "Email": f"{emp_name.lower().replace(' ', '.')}@promanage.dev",
            "Role": random.choice(ROLES),
            "Assigned Date": start.isoformat(),
            "Role on Project": random.choice(["Lead", "Contributor", "Reviewer"]),
        })

# Add fully unassigned employees as rows with no project
for emp_name in unassigned_pool:
    rows.append({
        "Project Name": "",
        "Start Date": "",
        "Deadline": "",
        "Actual Completion Date": "",
        "Status": "",
        "Progress %": "",
        "Employee Name": emp_name,
        "Email": f"{emp_name.lower().replace(' ', '.')}@promanage.dev",
        "Role": random.choice(ROLES),
        "Assigned Date": "",
        "Role on Project": "",
    })

df = pd.DataFrame(rows)
df.to_excel("sample_data.xlsx", index=False)
print(f"Created sample_data.xlsx with {len(df)} rows across {len(PROJECT_NAMES)} projects and {len(employees)} employees.")
