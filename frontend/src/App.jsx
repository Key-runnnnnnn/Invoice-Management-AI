import { useState } from 'react'
import './App.css'
import Home from './Pages/Home'
import { Toaster } from "react-hot-toast";

function App() {

  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
    <Home />
    </>
  )
}

export default App;
