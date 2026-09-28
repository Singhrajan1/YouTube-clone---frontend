import React from 'react';

export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="empty-state">
    <div className="empty-icon" aria-hidden="true">{icon}</div>
    <h3 className="empty-title">{title}</h3>
    {description && <p className="empty-desc">{description}</p>}
    {action && <div className="empty-action">{action}</div>}
  </div>
);
