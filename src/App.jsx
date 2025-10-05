
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PatientLogin from "./login/patient";
import LoadingPage from "./load";
import FormPage from "./form";

function App() {
  return (
   <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoadingPage/>} />
      <Route path="login" element={<PatientLogin />} />
      <Route path="form" element={<FormPage />} />
    </Routes>
   </BrowserRouter>
  )
}

export default App
