import React from 'react';

const StatCard = ({ title, value, change, icon }) => {
  return (
    <div style={{width: 262, height: 142, background: 'white', borderRadius: 12, outline: '1px #E4E4E7 solid', outlineOffset: '-1px'}}>
      <div style={{width: 212, height: 24, left: 25, top: 25, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
        <div style={{width: 102, height: 21, left: 0, top: 1, position: 'absolute', color: '#A1A1AA', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>{title}</div>
        {icon && (
          <div style={{width: 20, height: 16, left: 192, top: 4, position: 'absolute', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
            <div style={{width: 20, height: 16, position: 'relative', background: 'rgba(0, 0, 0, 0)', overflow: 'hidden'}}>
              <div style={{width: 20, height: 16, left: 0, top: 0, position: 'absolute', background: '#4F46E5'}} />
            </div>
          </div>
        )}
      </div>
      <div style={{width: 212, height: 32, left: 25, top: 65, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
        <div style={{width: 74, height: 30, left: 0, top: 1, position: 'absolute', color: '#3F3F46', fontSize: 24, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', wordWrap: 'break-word'}}>{value}</div>
      </div>
      {change && (
        <div style={{width: 212, height: 20, left: 25, top: 97, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
          <div style={{width: 49, height: 18, left: 10.50, top: 1, position: 'absolute', color: '#10B981', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', wordWrap: 'break-word'}}>{change}</div>
          <div style={{width: 10.50, height: 14, left: 0, top: 3.75, position: 'absolute', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
            <div style={{width: 10.50, height: 14, position: 'relative', background: 'rgba(0, 0, 0, 0)', overflow: 'hidden'}}>
              <div style={{width: 10.50, height: 12.25, left: 0, top: 0.88, position: 'absolute', background: '#10B981'}} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;