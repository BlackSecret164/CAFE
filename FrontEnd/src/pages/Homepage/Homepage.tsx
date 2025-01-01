import React from 'react';
import './Homepage.scss';
import CAFEIMG from '../../assets//coffee.png';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return <header className="header">CAFÉ W FEN</header>;
};

interface LoginButtonProps {}

const LoginButton: React.FC<LoginButtonProps> = () => {
  return <button className="login-button">LOG IN</button>;
};

interface HomepageProps {}

const Homepage: React.FC<HomepageProps> = () => {
  return (
    <div className="homepage">
      <div className="content-container">
        <Header />
        <main className="main-content">
          
          <div className='left-container'>
            <div className="slogan-line">
              <span className="slogan-text">be energetic</span>
            </div>
            <div className="slogan-line-2">
              <span className="slogan-text">with coffee</span>
            </div>
          </div>
          <div className="quote">
              "Always provide the best service and always maintain the quality of coffee"
            </div>
          <LoginButton />

        </main>
          <div className="image-container">
            <img src={CAFEIMG} alt="cafe" className="cafe-image" />
          </div>
        
      </div>
      
    </div>
  );
};

export default Homepage;
