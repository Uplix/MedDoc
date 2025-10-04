import { BrowserRouter, Routes, Route } from "react-router";
import PatientLogin from "./login/patient";

function App() {
  return (
   <BrowserRouter classname="">
    <Routes>
      <Route path="/" element={<div></div>}/>
      <Route path="login" element={<PatientLogin />} />
    </Routes>
   </BrowserRouter>
  )
}

export default App
