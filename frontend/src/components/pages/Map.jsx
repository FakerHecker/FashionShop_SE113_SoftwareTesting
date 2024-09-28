import React from 'react'

const Map = ({ address, title }) => {
  const mapSrc = `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(
    address
  )}&key=AIzaSyAnrcJtpjxQ4vCznjLuTGPWzu_qi30qulE`;

  return (
    <div>
      <h5>{title}</h5>
      <div className="map-container">
        <iframe
          width="600"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={mapSrc}
          title={title}
        ></iframe>
      </div>
      <p>{address}</p>
    </div>
  );
}

export default Map