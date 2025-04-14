import React from 'react';

const Sidebar = () => {
  return (
    <div style={{width: 256, height: 1440, left: 0, top: 0, position: 'absolute', background: 'white', borderRight: '1px #E4E4E7 solid'}}>
      <div style={{width: 207, height: 28, left: 24, top: 24, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
        <div style={{width: 24, height: 24, left: 0, top: 2, position: 'absolute', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
          <div style={{width: 24, height: 24, position: 'relative', background: 'rgba(0, 0, 0, 0)', overflow: 'hidden'}}>
            <div style={{width: 24, height: 24, left: 0, top: 0, position: 'absolute', background: '#4F46E5'}} />
          </div>
        </div>
        <div style={{width: 83, height: 25, left: 36, top: 1, position: 'absolute', color: '#3F3F46', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: 20, wordWrap: 'break-word'}}>LibraryAI</div>
      </div>
      
      <div style={{width: 207, height: 272, left: 24, top: 92, position: 'absolute', background: 'rgba(0, 0, 0, 0)'}}>
        <NavItem active title="Dashboard" icon="dashboard" />
        <NavItem title="Books" icon="books" />
        <NavItem title="Readers" icon="readers" />
        <NavItem title="Events" icon="events" />
        <NavItem title="Settings" icon="settings" />
      </div>
    </div>
  );
};

const NavItem = ({ title, icon, active }) => {
  const baseStyle = {
    width: 207,
    height: 48,
    position: 'relative',
    borderRadius: 8,
    marginBottom: 8
  };

  const activeStyle = active ? {
    background: '#4F46E5',
    color: 'white'
  } : {
    background: 'rgba(0, 0, 0, 0)',
    color: '#3F3F46'
  };

  return (
    <div style={{...baseStyle, ...activeStyle}}>
      <div style={{width: 16, height: 16, left: 12, top: 16, position: 'absolute'}}>
        {/* Icon would go here - simplified for now */}
      </div>
      <div style={{
        left: 40,
        top: 13,
        position: 'absolute',
        fontSize: 16,
        fontFamily: 'Plus Jakarta Sans',
        fontWeight: '400',
        wordWrap: 'break-word'
      }}>
        {title}
      </div>
    </div>
  );
};

export default Sidebar;