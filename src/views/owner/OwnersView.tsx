import { Link } from "react-router-dom";

export default function OwnersView() {
  return (
    <>
    <Link 
        to="/owners/create"
        className=" btn-primary">
        Crear dueño
    </Link>
    </>
  )
}
