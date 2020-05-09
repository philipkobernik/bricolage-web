import { useAuthState } from 'react-firebase-hooks/auth';

import ProjectsList from './ProjectsList'

const CurrentUser = ({fb}) => {
  const [user, initialising, error] = useAuthState(fb.auth());
  const login = () => {
    fb.auth().signInWithPopup(new fb.auth.GoogleAuthProvider())
  };
  const logout = () => {
    fb.auth().signOut();
  };

  console.log("currentUser");

  if (initialising) {
    return (
      <div>
        <p>Initialising User...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }
  if (user) {
    return (
      <div>
        <p>Current User: {user.email}</p>
        <button onClick={logout}>Log out</button>

        <ProjectsList fb={fb} />
      </div>
    );
  }
  return <button onClick={login}>Log in</button>;
};

export default CurrentUser;
