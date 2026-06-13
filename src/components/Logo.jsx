import logoImg from '../assets/logo.jpg';

export default function Logo({isDev,onClick}){
  return(
    <div className="logo-new" onClick={onClick} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <img 
        src={logoImg} 
        alt="Border Grill" 
        style={{ 
          height: '24px', 
          width: 'auto', 
          objectFit: 'contain', 
          mixBlendMode: 'multiply',
          display: 'block'
        }} 
      />
    </div>
  );
}
