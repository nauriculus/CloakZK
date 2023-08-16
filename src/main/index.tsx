import "./Main.css";

import React, { useState, useEffect, useRef  } from 'react';

const Main = () => {

 const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="animation2" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: isMounted ? '-20%' : '-20%',
      borderRadius: '20px',
      transition: 'margin-center 2s ease',
    }}>
      <div className="animation" style={{
        borderRadius: '1px',
        padding: '50px',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        width: '50%',
        opacity: isMounted ? 1 : 0,
        transform: isMounted ? 'translateY(0)' : 'translateY(-50%)',
        transition: 'opacity 1s ease, transform 1s ease',
      }}>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1
              className="heading-main"
              style={{
                color: '#FFF',
                fontSize: '100px',
                lineHeight: '1',
                textAlign: 'center',
                marginTop: '50%',
                marginBottom: '30%',
                zIndex: '1',
                background: 'radial-gradient(50% 50% at 50% 50%, rgb(248,138,252,255) 0%, rgb(108,39,255,255) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Bebas Neue, cursive',
              }}
            >
              Seamless Trades Ultimate Privacy.
            </h1>
          </div>
          <div style={{ marginTop: '-50%',
          fontSize: '50%',
          fontFamily: 'Oswald' }}> {/* Adjusted marginTop for spacing */}
            <a href="/otc" className="start-btn" id="start-btn">
              Trade Now
            </a>
          </div>
        
      </div>
    </div>
  );
  
 }

export default Main;
