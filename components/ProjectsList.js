import { useCollection } from 'react-firebase-hooks/firestore';
import { useState } from 'react'

function useInput({ type /*...*/ }) {
   const [value, setValue] = useState("");
   const input = <input value={value} onChange={e => setValue(e.target.value)} type={type} />;
   return [value, input, setValue];
 }


const AddProject = ({fb}) => {
  const [name, nameInput, setName] = useInput({ type: "text" });

  const handleSubmit = (event) => {
    var user = fb.auth().currentUser;
    event.preventDefault()
    console.log('submit!');

    var db = fb.firestore()
    const date = new Date().getTime()
    console.log(user)
    db.collection('projects')
      .doc()
      .set({
        id: date,
        name: name,
        artist: user.uid,
        artistName: user.displayName
      })
    setName('');

  }

  return <>
    <form onSubmit={handleSubmit}>
      {nameInput}
    </form>
 </>;

}

const ProjectListItem = ({doc, fb}) => {
  const onEdit = (event) => {
    console.log('edit')
  }
  const onDelete = (event) => {
    console.log('attempt delete')
    fb.firestore()
      .collection('projects')
      .doc(doc.id)
      .delete()
      .then(function() {
        console.log("delete success");
      }).catch(function(error) {
        console.error("delete error!", error);
      });
  }
  return (
    <li key={doc.id}>
      <em>
        {doc.data().name}
      </em>, by {doc.data().artistName}
      <br />
      <button onClick={onEdit}>edit</button>
      <button onClick={onDelete}>delete</button>
    </li>
  )
}

const ProjectsList = ({fb}) => {
  const [projects, loading, error] = useCollection(
    fb.firestore().collection('projects'), {}
  );

  return (
    <div>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Collection: Loading...</span>}
        {projects && (
          <>
            <AddProject fb={fb} />
            Collection:{' '}
            <ul>
            {projects.docs.map(doc => (
              <ProjectListItem doc={doc} fb={fb} />
            ))}
            </ul>
          </>
        )}
    </div>
  )
}

export default ProjectsList;
