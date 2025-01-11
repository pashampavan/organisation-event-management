import context from './useContext';
import { useHistory } from 'react-router-dom';
import { useState,useEffect } from 'react';
const Context = (props) => {
    const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const handleClick=(severity,message)=>{
    setSeverity(severity);
    setMessage(message);
    setOpen(true);
  }
  const handleClose=()=>{
    setOpen(false);
  }
  const [severity, setSeverity] = useState('success');
    const [login,setLogin]=useState(false);
    return (
        <context.Provider value={{handleClick,handleClose,login,setLogin,severity, setSeverity,message, setMessage,open, setOpen}}>
                        {props.children}
        </context.Provider>
    )
}
export default Context;