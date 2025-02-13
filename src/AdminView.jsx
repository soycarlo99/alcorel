import { useEffect } from "react"

export default function AdminView() {
    useEffect(() => {
        async function GetCategory() {
            try {
                const response = await fetch("/api/category");
                const body = await response.json();

                console.log(body);
            } catch (error) {
                console.error(error)
            }

        }

        GetCategory();

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



