const users = [];

export const signup = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existingUser = users.find(u => u.email === email.toLowerCase());
      if (existingUser) {
        reject(new Error('User with this email already exists.'));
      } else {
        users.push({ email: email.toLowerCase(), password });
        resolve();
      }
    }, 500); // simulate async delay
  });
};

export const login = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.email === email.toLowerCase());
      if (!user) {
        reject(new Error('User not found. Please sign up.'));
      } else if (user.password !== password) {
        reject(new Error('Incorrect password.'));
      } else {
        resolve();
      }
    }, 500); // simulate async delay
  });
};
