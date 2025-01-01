import React from 'react';
import './ActionButton.scss';

const ActionButton = ({ count, onIncrease, onDecrease }) => {
  return (
    <div className="action-button">
      <button className="decrease" onClick={onDecrease} disabled={count <= 0}>
        -
      </button>
      <span className="count">{count}</span>
      <button className="increase" onClick={onIncrease}>
        +
      </button>
    </div>
  );
};

export default ActionButton;
