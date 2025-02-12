
export default function TicketCreation()
{
    
    return (
    <main>
        <form>
        <label>Enter your name:
            <input
                type="text"
                    value={name}
                onChange={(e) => setName(e.target.value)}
            />
            </label>
            
            
                <label>Enter your email:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
            
            
                <label>Enter your phonenumber:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
            </form>
            
    
        </main>
    
    )
}