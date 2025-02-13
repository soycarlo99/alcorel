import { useEffect } from "react"

export default function AdminView() {
    useEffect(() => {
        async function GetUsers() {
            try {
                const response = await fetch("localhost:5001/api/tickets/");
                const body = await response.json();

                console.log(body.name);
            } catch (error) {
                console.error(error)
            }

        }

        GetUsers();
    }, []);


    return (
        <>
            <p>Add Category</p>
            <input type="text" />
            <button>Add</button>
            <ul>
                <p>Existing categories:</p>

            </ul>



        </>
    )
}



