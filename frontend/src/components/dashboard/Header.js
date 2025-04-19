import React from 'react';

const Header = () => {
  return (
    <div style={{width: 1600, height: 61, left: 0, top: 0, position: 'absolute'}}>
      <div style={{width: 1600, height: 61, left: 0, top: 0, position: 'absolute', background: 'white', boxShadow: '0px 1px 0px rgba(18, 32, 59, 0.09)'}} />
      
      {/* Search Bar */}
      <div style={{width: 910, height: 40, left: 325, top: 11, position: 'absolute', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
        <div style={{alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 17, paddingBottom: 17, background: 'white', borderRadius: 10, outline: '1px #E4E4E7 solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div style={{width: 18, height: 18, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div style={{width: 18, height: 18, position: 'relative', overflow: 'hidden'}}>
              <div style={{width: 13.50, height: 13.50, left: 2.25, top: 2.25, position: 'absolute', outline: '1.50px #A1A1AA solid', outlineOffset: '-0.75px'}} />
            </div>
          </div>
          <div style={{width: 227, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#A1A1AA', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: 20, wordWrap: 'break-word'}}>Type to search</div>
        </div>
      </div>

      {/* User Profile */}
      <div style={{width: 25, height: 25, left: 1443, top: 19, position: 'absolute', overflow: 'hidden'}}>
        <div style={{width: 16.67, height: 18.75, left: 4.17, top: 3.12, position: 'absolute', outline: '1.20px #3F3F46 solid', outlineOffset: '-0.60px'}} />
      </div>
      <div style={{width: 25, height: 25, left: 1393, top: 20, position: 'absolute', overflow: 'hidden'}}>
        <div style={{width: 18.75, height: 14.58, left: 3.12, top: 5.21, position: 'absolute', outline: '1.20px #3F3F46 solid', outlineOffset: '-0.60px'}} />
      </div>
      <img style={{width: 36, height: 36, left: 1498, top: 13, position: 'absolute', borderRadius: 9999}} src="https://placehold.co/36x36" />
    </div>
  );
};

export default Header;