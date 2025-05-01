// import './App.css';
// import AppRoutes from "./routes";
// import { AuthProvider } from "./context/AuthProvider";
// import { useEffect, useState } from "react";
// import OfflineNotice from "./components/OfflineNotice";
// import Axios from "./utils/Axios";

// function App() {
//   const [serverOnline, setServerOnline] = useState(true);

//   useEffect(() => {
//     Axios.get("/")
//       .then(() => setServerOnline(true))
//       .catch(() => setServerOnline(false));
//   }, []);

//   return (
//     <>
//       {serverOnline ? (
//         <AuthProvider>
//           <AppRoutes />
//         </AuthProvider>
//       ) : (
//         <OfflineNotice />
//       )}
//     </>
//   );
// }

// export default App;

import './App.css'
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthProvider";

function App() {

  return (
    <>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </>
  )
}

export default App