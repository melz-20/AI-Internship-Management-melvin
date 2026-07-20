function DashboardCards({ data }) {
  const cards = [["Total Assessments", data.total, "bi-clipboard-data"], ["Active", data.active, "bi-play-circle"], ["Pending", data.pending, "bi-hourglass-split"], ["Completed", data.completed, "bi-check2-circle"], ["Average Score", `${data.average_score}%`, "bi-bar-chart"], ["Pass Percentage", `${data.pass_percentage}%`, "bi-trophy"], ["Latest Score", `${data.latest_score}%`, "bi-lightning-charge"], ["Upcoming", data.upcoming, "bi-calendar-event"]];
  return <div className="row g-3 mb-4">{cards.map(([label, value, icon]) => <div className="col-6 col-md-3" key={label}><div className="metric-card"><i className={`bi ${icon}`}></i><div><small>{label}</small><strong>{value}</strong></div></div></div>)}</div>;
}
export default DashboardCards;
