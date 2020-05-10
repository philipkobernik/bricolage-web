import { useCollection } from 'react-firebase-hooks/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
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

const ProjectListItem = ({projectId, fb}) => {

  const [project, projectLoading, projectError] = useDocument(
    fb.firestore().doc(`projects/${projectId}`), {}
  );

  const [imageUrls, loading, error] = useCollection(
    fb.firestore().collection(`projects/${projectId}/imageUrls`), {}
  );


  const onEdit = (event) => {
    console.log('edit')
  }

  const onDelete = (event) => {
    console.log('attempt delete')
    fb.firestore()
      .collection('projects')
      .doc(projectId)
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
      .child(`images/${projectId}/${file.name}`)
      .put(file)
      .then(s=>{
        fb.storage()
          .ref()
          .child(`images/${projectId}/${file.name}`)
          .getDownloadURL()
          .then(url=>{
            console.log('file upload success');
            //this.setState({img: url, imgDownLoaded: true});
            fb.firestore()
              .collection(`projects/${projectId}/imageUrls`)
              .add({
                url: url
              })
          })
      })
  }

  return (
    <li key={projectId}>
    { project && (
      <>
      <em>
        {project.data().name}
      </em>
      <br />
      <button onClick={onEdit}>edit</button>
      <button onClick={onDelete}>delete</button>
      <input accept='image/*'
        multiple type='file'
        onChange={uploadImg}
        /* ref={ el=>this.fileInput = el } */
      />	

      <section id="photos">
        {imageUrls && (
          imageUrls.docs.map(doc => (
            <img key={doc.id} src={doc.data().url} />
          ))
        )
        }
      </section>
      <style jsx>{`
#photos {
   /* Prevent vertical gaps */
   line-height: 0;
   
   -webkit-column-count: 5;
   -webkit-column-gap:   0px;
   -moz-column-count:    5;
   -moz-column-gap:      0px;
   column-count:         5;
   column-gap:           0px;
}

#photos img {
  /* Just in case there are inline attributes */
  width: 100% !important;
  height: auto !important;
}

@media (max-width: 1200px) {
  #photos {
  -moz-column-count:    4;
  -webkit-column-count: 4;
  column-count:         4;
  }
}
@media (max-width: 1000px) {
  #photos {
  -moz-column-count:    3;
  -webkit-column-count: 3;
  column-count:         3;
  }
}
@media (max-width: 800px) {
  #photos {
  -moz-column-count:    2;
  -webkit-column-count: 2;
  column-count:         2;
  }
}
@media (max-width: 400px) {
  #photos {
  -moz-column-count:    1;
  -webkit-column-count: 1;
  column-count:         1;
  }
}

body {
  margin: 0;
  padding: 0;
}
      `}
      </style>
      </>)
    }</li>
  )
}

const ProjectsList = ({fb}) => {

  //const [user, initialising, authError] = useAuthState(fb.auth());
  var user = fb.auth().currentUser;

  const [projectIds, loading, error] = useCollection(
    fb.firestore().collection(`users/${user.email}/projects`), {} // => collection of references to projects!
  );

  return (
    <div>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Collection: Loading...</span>}
        {projectIds && (
          <>
            <AddProject fb={fb} />
            Collection:{' '}
            <ul>
            {projectIds.docs.map(doc => (
              <ProjectListItem key={doc.id} projectId={doc.id} fb={fb} />
            ))}
            </ul>
          </>
        )}
    </div>
  )
}

export default ProjectsList;
