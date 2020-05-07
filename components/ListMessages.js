import { useCollection } from 'react-firebase-hooks/firestore';
import { useState } from 'react'

function useInput({ type /*...*/ }) {
   const [value, setValue] = useState("");
   const input = <input value={value} onChange={e => setValue(e.target.value)} type={type} />;
   return [value, input, setValue];
 }


const AddMessage = ({fb}) => {
  const [msg, msgInput, setMsg] = useInput({ type: "text" });

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('submit!');

    var db = fb.firestore()
    const date = new Date().getTime()
    db.collection('messages')
      .doc(`${date}`)
      .set({
        id: date,
        text: msg,
      })
    setMsg('');

  }

  return <>
    <form onSubmit={handleSubmit}>
      {msgInput}
    </form>
 </>;

}

const ListMessages = ({fb}) => {
  const [messages, loading, error] = useCollection(
    fb.firestore().collection('messages'), {}
  );

  return (
    <div>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Collection: Loading...</span>}
        {messages && (
          <>
            <AddMessage fb={fb} />
            Collection:{' '}
            <ul>
            {messages.docs.map(doc => (
              <li key={doc.id}>
                {doc.data().text}
              </li>
            ))}
            </ul>
          </>
        )}
    </div>
  )
}

export default ListMessages;
