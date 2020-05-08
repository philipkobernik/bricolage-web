import React, { Component, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/storage'
import 'firebase/auth'
import 'firebase/firestore'
import 'isomorphic-unfetch'
import clientCredentials from '../credentials/client'

import ProjectsList from '../components/ProjectsList'
import CurrentUser from '../components/CurrentUser'

export async function getServerSideProps({ req, query }) {
  const user = req.session && req.session.decodedToken ? req.session.decodedToken : null
  // don't fetch anything from firebase if the user is not found
  // const snap = user && await req.firebaseServer.database().ref('messages').once('value')
  // const messages = snap && snap.val()
  const messages = null
  return {
    props: {
      user,
      messages,
    },
  }
}

class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: this.props.user,
      value: '',
      messages: this.props.messages,
      img: '',
      imgDownLoaded: true,
    }
  }

  uploadImg = e => {
    const file = this.fileInput.files[0]
    console.log('file', file, file.name)
    this.setState({imgDownLoaded: false});

    firebase.storage()
      .ref()
      .child(`images/${this.state.user.uid}/${file.name}`)
      .put(file)
      .then(s=>{
        firebase.storage()
          .ref()
          .child(`images/${this.state.user.uid}/${file.name}`)
          .getDownloadURL()
          .then(url=>{
            console.log('file upload success');
            this.setState({img: url, imgDownLoaded: true});
          })
      })
  }

  componentDidMount() {
    console.log("index cDM");
    firebase.initializeApp(clientCredentials)
    this.addDbListener() // initializes firestore
  }

  addDbListener() {
    var db = firebase.firestore()
    let unsubscribe = db.collection('messages').onSnapshot(
      querySnapshot => {
        var messages = {}
        querySnapshot.forEach(function(doc) {
          messages[doc.id] = doc.data()
        })
        if (messages) this.setState({ messages })
      },
      error => {
        console.error(error)
      }
    )
    this.setState({ unsubscribe })
  }

  render() {
    const { user, value, messages } = this.state

    return (
      <div>
        <h1><em>bricolage</em></h1>

        {firebase.apps.length > 0 && // whats the right way to do this?
        <>
          <CurrentUser fb={firebase} />
          <ProjectsList fb={firebase} />
        </>
        }
      </div>
    )
  }
}

export default Index;
