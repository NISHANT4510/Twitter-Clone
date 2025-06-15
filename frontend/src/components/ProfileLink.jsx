import React from 'react';
import { Link } from 'react-router-dom';

const ProfileLink = ({ username, children }) => {
  return (
    <Link to={`/profile/${username}`} className="text-blue-500 hover:text-blue-700">
      {children || `@${username}`}
    </Link>
  );
};

export default ProfileLink;
