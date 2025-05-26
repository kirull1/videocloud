export const getJWT = (key: string = 'token') => {
  const jwt = localStorage.getItem(key);
  
  if (!jwt) throw new Error('Token is required');

  return jwt;
};
