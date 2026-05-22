import React from 'react';

export default function GuideCharacter() {
  return (
    <div className="guide-character">
      <div className="robot-head">
        <div className="robot-eyes">
          <span className="robot-eye"></span>
          <span className="robot-eye"></span>
        </div>
        <div className="robot-mouth"></div>
      </div>
      <div className="robot-body">
        <div className="robot-panel"></div>
      </div>
      <p className="guide-text">Привет! Я RoboKid, твой помощник.</p>
    </div>
  );
}