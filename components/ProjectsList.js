import { useCollection } from 'react-firebase-hooks/firestore';
import { useDownloadURL } from 'react-firebase-hooks/storage';
import { useAuthState } from 'react-firebase-hooks/auth';

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
      .add({
        createdAt: date,
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

  const [imageUrls, loading, error] = useCollection(
    fb.firestore().collection(`projects/${doc.id}/imageUrls`), {}
  );


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

  const uploadImg = e => {
    const file = e.target.files[0]
    console.log('file', file, file.name)
    //this.setState({imgDownLoaded: false});

    fb.storage()
      .ref()
      //.child(`images/${this.state.user.uid}/${file.name}`)
      .child(`images/${doc.id}/${file.name}`)
      .put(file)
      .then(s=>{
        fb.storage()
          .ref()
          .child(`images/${doc.id}/${file.name}`)
          .getDownloadURL()
          .then(url=>{
            console.log('file upload success');
            //this.setState({img: url, imgDownLoaded: true});
            fb.firestore()
              .collection(`projects/${doc.id}/imageUrls`)
              .add({
                url: url
              })
          })
      })
  }

  console.log('render');
  return (
    <li key={doc.id}>
      <em>
        {doc.data().name}
      </em>, by {doc.data().artistName}
      <br />
      <button onClick={onEdit}>edit</button>
      <button onClick={onDelete}>delete</button>
      <input accept='image/*'
        multiple type='file'
        onChange={uploadImg}
        /* ref={ el=>this.fileInput = el } */
      />	

      <ul>
        {imageUrls && (
          imageUrls.docs.map(doc => (
            <li key={doc.id}>
              <img src={doc.data().url} />
            </li>
          ))
        )
        }
      </ul>
    </li>
  )
}

const ProjectsList = ({fb}) => {

  //const [user, initialising, authError] = useAuthState(fb.auth());
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
              <ProjectListItem key={doc.id} doc={doc} fb={fb} />
            ))}
            </ul>
          </>
        )}
    </div>
  )
}

export default ProjectsList;
