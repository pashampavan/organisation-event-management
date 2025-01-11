import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Events = () => {
  return (
    <Routes>
        {/* <Route path='/login' exact element={<Login />} /> */}
        <Route
          path="/"
          element={ <Navigate to="/events/all-events"  replace={false}/> }
        />
       
    </Routes>
  )
}

export default Events

