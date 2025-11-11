import React from "react";
import "./TaskCard.css";
const TaskCard = ({
  created,
  desc,
  duration,
  endTime,
  proof,
  punishMent,
  punishmentDuration,
  reviewedByAI,
  startTime,
  status,
  title,
  id,
  owner,
}) => {
  return (
    <div className={`task-card ${status}`}>
      <div className="task-header">
        <h2 className="task-title">{title}</h2>
        <span className={`task-status ${status}`}>{status}</span>
      </div>

      <p className="task-desc">{desc}</p>

      <div className="task-time">
        <div>
          <strong>Start:</strong>{" "}
          {new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div>
          <strong>End:</strong>{" "}
          {new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div>
          <strong>Duration:</strong> {duration} mins
        </div>
        <div>
          <strong>Created:</strong>{" "}
          {new Date(created).toLocaleDateString()}
        </div>
      </div>

      {reviewedByAI && <div className="reviewed"> Reviewed by AI</div>}

      {status === "failed" && (
        <div className="punishment">
           Punishment: {punishMent} ({punishmentDuration})
        </div>
      )}

      {proof && (
        <a
          href={proof}
          target="_blank"
          rel="noreferrer"
          className="proof-link"
        >
          View Proof
        </a>
      )}
    </div>
  );
};

export default TaskCard;
