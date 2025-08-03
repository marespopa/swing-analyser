import React, { useState } from 'react';

const TestInput: React.FC = () => {
  const [value, setValue] = useState('');

  return (
    <div className="p-8">
      <h2>Test Input</h2>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type here..."
        className="border p-2"
      />
      <p>Value: {value}</p>
    </div>
  );
};

export default TestInput; 