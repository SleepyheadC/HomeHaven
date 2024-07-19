import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
// import {Link} from 'react-router-dom'
import { signInFailure, signInSuccess, signInStart, updateUserStart, updateUserFailure, updateUserSuccess, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserStart, signOutUserFailure, signOutUserSuccess } from '../redux/user/userSlice';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData] = useState({});
  const [fileUploadError, setFileUploadError] = useState(false);
  const dispatch = useDispatch();
  // const token = localStorage.getItem('token');
  console.log(formData);
  // console.log(filePerc);
  // console.log(setFileUploadError);
  // console.log(file);

  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2*1024*1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if(file){
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    // app is passed which we have created in firebase.js
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done');
  
        setFilePerc(Math.round(progress));
      },
  
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => 
          setFormData({ ...FormData, avatar: downloadURL })
       );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value});
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  console.log('currentUser:', currentUser);
  console.log('formData:', formData);
  console.log('error:', error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user/update/${currentUser._id}`,{
        method:'POST',
        headers: {
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body:JSON.stringify(formData),
      });
      // console.log(res);
      const data = await res.json();
       if(data.success === false){
        dispatch(updateUserFailure(data.message));
        return ;
      } 

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
        dispatch(updateUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(data.message));
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className = 'text-3xl font-semibold text-center my-7'> Profile </h1>
      <form onSubmit = {handleSubmit} className = 'flex flex-col gap-4'>
        <input onChange = {(e) => setFile(e.target.files[0])} 
        type = 'file' ref = {fileRef} hidden accept = 'image/*'/>
        {/* if there is any image in the formdata show that image otherwise show the image from the database */}
        <img onClick = {()=>fileRef.current.click()} src = {formData.avatar || currentUser.avatar} alt="profile"
        className = 'rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'/>
        <p className = 'text-sm self-center'>
          {fileUploadError? (
            <span className = 'text-red-700'>Error Image Upload (Image should be less than 2 MB)</span>): filePerc>0 && filePerc <100 ?(
            <span className = 'text-slate-700'>
              {`Uploading ${filePerc}%`}
            </span>)
            :
            filePerc === 100 ? (
              <span className = 'text-green-700'>Image successfully uploaded!</span>
            ): (
              ''
          )}
        </p>
        <input type = "text" defaultValue={currentUser.username} placeholder='username' id = 'username'
        className ='border p-3 rounded-lg' onChange={handleChange}/>
        <input type = "email" defaultValue = {currentUser.email}placeholder='email' id = 'email'
        className ='border p-3 rounded-lg' onChange={handleChange}/>
        <input type = "password" placeholder='password' id = 'password'
        className ='border p-3 rounded-lg' onChange={handleChange}/>
        <button disabled = {loading} className = 'bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled_opacity-80'>{loading?'Loading...':'Update'}</button>

      </form>
      <div className = "flex justify-between mt-5">
        <span onClick = {handleDeleteUser} className = "cursor-pointer text-red-700">Delete account</span>
        <span onClick = { handleSignOut }className = "cursor-pointer text-red-700">Sign out</span>
      </div>

      <p className = 'text-red-700 mt-5'>{error ? error : ''}</p>
      <p className = 'text-green-700 mt-5'>{updateSuccess?'User Updated Successfully':''}</p>
    </div>
  )
}



 

