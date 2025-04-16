import React from 'react';

const TopEntities = ({ cases = [] }) => {
  // Calculate top entities based on number of cases
  const getTopEntities = () => {
    const entityCounts = cases.reduce((acc, caseItem) => {
      const entity = caseItem.govEntityName;
      acc[entity] = (acc[entity] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort by count
    return Object.entries(entityCounts)
      .map(([name, count]) => ({
        name,
        count,
        highPriority: cases.filter(c => 
          c.govEntityName === name && 
          c.complaintLevel.toUpperCase() === 'HIGH'
        ).length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Get top 3
  };

  const topEntities = getTopEntities();

  return (
    <div style={{width: 548, height: 270, background: 'white', borderRadius: 12, outline: '1px #E4E4E7 solid', outlineOffset: '-1px'}}>
      <div style={{width: 498, height: 28, left: 25, top: 25, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
        <div style={{width: 178, height: 23, left: 0, top: 2, position: 'absolute', color: '#3F3F46', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', wordWrap: 'break-word'}}>Top Government Entities</div>
      </div>
      
      <div style={{width: 498, height: 176, left: 25, top: 69, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
        {topEntities.map((entity, index) => (
          <EntityItem 
            key={entity.name}
            name={entity.name}
            totalCases={entity.count}
            highPriority={entity.highPriority}
            top={index * 60}
          />
        ))}
      </div>
    </div>
  );
};

const EntityItem = ({ name, totalCases, highPriority, top }) => {
  return (
    <div style={{width: 498, height: 44, left: 0, top, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
      <div style={{width: 40, height: 40, left: 0, top: 2, position: 'absolute', borderRadius: 9999, background: '#F4F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>
        {name.charAt(0)}
      </div>
      <div style={{width: 341.11, height: 44, left: 56, top: 0, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
        <div style={{width: 337, height: 21, left: 0, top: 1, position: 'absolute', color: '#3F3F46', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: 16, wordWrap: 'break-word'}}>{name}</div>
        <div style={{width: 200, height: 18, left: 0, top: 25, position: 'absolute', color: '#A1A1AA', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: 14, wordWrap: 'break-word'}}>
          {totalCases} cases ({highPriority} high priority)
        </div>
      </div>
    </div>
  );
};

export default TopEntities;
