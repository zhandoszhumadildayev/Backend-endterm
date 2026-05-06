import React from 'react';

export default function GuideCharacter() {
  return (
    <div className="guide-wrap">
      <div className="guide-bird" aria-label="Learning assistant">
        <div className="bird-ear left" />
        <div className="bird-ear right" />
        <div className="bird-eye left"><span /></div>
        <div className="bird-eye right"><span /></div>
        <div className="bird-beak" />
        <div className="bird-book"><span /><span /></div>
      </div>
      <div className="guide-bubble">Готов к уроку? 🚀</div>
    </div>
  );
}
