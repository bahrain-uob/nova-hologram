import React from 'react';

const RecentActivity = ({ cases = [] }) => {
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getComplaintLevelIcon = (level) => {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return '🔴';
      case 'MEDIUM':
        return '🟡';
      case 'LOW':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div style={{width: 548, height: 270, background: 'white', borderRadius: 12, outline: '1px #E4E4E7 solid', outlineOffset: '-1px'}}>
      <div style={{width: 498, height: 28, left: 25, top: 25, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
        <div style={{width: 128, height: 23, left: 0, top: 2, position: 'absolute', color: '#3F3F46', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', wordWrap: 'break-word'}}>Recent Cases</div>
      </div>
      
      <div style={{width: 498, height: 164, left: 25, top: 69, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
        {cases.map((caseItem, index) => (
          <ActivityItem 
            key={caseItem.caseID}
            icon={getComplaintLevelIcon(caseItem.complaintLevel)}
            caseId={caseItem.caseID}
            entity={caseItem.govEntityName}
            time={formatTimeAgo(caseItem.submissionDate)}
            top={index * 60}
          />
        ))}
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, caseId, entity, time, top }) => {
  return (
    <div style={{width: 498, height: 44, left: 0, top, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
      <div style={{width: 40, height: 40, left: 0, top: 2, position: 'absolute', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>
        {icon}
      </div>
      <div style={{width: 341.11, height: 44, left: 56, top: 0, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
        <div style={{width: 337, height: 21, left: 0, top: 1, position: 'absolute', color: '#3F3F46', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>
          Case #{caseId} - {entity}
        </div>
        <div style={{width: 77, height: 18, left: 0, top: 25, position: 'absolute', color: '#A1A1AA', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: 14, wordWrap: 'break-word'}}>{time}</div>
      </div>
    </div>
  );
};

export default RecentActivity;
