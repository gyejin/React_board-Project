import React, { useState } from 'react';

function CommentForm({ handleSubmit, submitLabel }) {
  const [text, setText] = useState('');
  const isTextareaDisabled = text.length === 0;

  const onSubmit = (event) => {
    event.preventDefault();
    handleSubmit(text);
    setText('');
  };

  return (
    <form onSubmit={onSubmit}>
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="px-4 py-2 mt-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        disabled={isTextareaDisabled}
      >
        {submitLabel}
      </button>
    </form>
  );
}

export default CommentForm;