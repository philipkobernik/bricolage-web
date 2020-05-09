import { useCollection } from 'react-firebase-hooks/firestore';
import { useDownloadURL } from 'react-firebase-hooks/storage';

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

  const [imageUrls, setImageUrls] = useState([]);


  const onEdit = (event) => {
    console.log('edit')
  }

  const storageRef = fb.storage().ref(`images/${doc.id}`);

  storageRef.listAll().then(function(result) {
    result.items.forEach(function(imageRef) {
      // And finally display them
      //displayImage(imageRef);
      imageRef.getDownloadURL().then(function(url) {
        // TODO: Display the image on the UI
        //setImageUrls(imageUrls => [...imageUrls, url])
        setImageUrls(imageUrls => (
          Array.from(new Set([...imageUrls, url]))
        ))
      }).catch(function(error) {
        // Handle any errors
        console.log('err', error);
      });
    });
  }).catch(function(error) {
    // Handle any errors
    console.log('list_all err', error);
  });

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
        {
          imageUrls.map(url => (
            <li key={url}>
              <img src={url} />
            </li>
          ))
        }
      </ul>
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
