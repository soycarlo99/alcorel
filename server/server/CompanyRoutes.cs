using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;


public static class CompanyRoutes
{
    
    
    public record Company(
        string company
    );
    
    
    
    public static async Task<List<Company>> GetCompanyName(NpgsqlDataSource db)
    {
        List<Company> result = new();
        using var query = db.CreateCommand("SELECT name FROM company WHERE id = 2");
        using var reader = await query.ExecuteReaderAsync();
 
        while (await reader.ReadAsync())
        {
            result.Add(new(
                reader.GetString(0)
            ));
        }
        return result;
    }
    
    
    
    
}








//SELECT name FROM company WHERE id = 2;