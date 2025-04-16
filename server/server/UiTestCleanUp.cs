using System.Diagnostics;
using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;

namespace Server;

public static class UiTestCleanUp
{
    public static async Task<Results<Ok<string>, BadRequest<string>>> RemoveTicket(
        NpgsqlDataSource db,
        HttpContext ctx
    )
    {
        using var command = db.CreateCommand(@"DELETE FROM tickets WHERE category = 17");
        try
        {
            var rowsAffected = await command.ExecuteNonQueryAsync();

            if (rowsAffected > 0)
            {
                return TypedResults.Ok($"Deleted {rowsAffected} tickets successfully");
            }
            else
            {
                return TypedResults.Ok("No ticket(s) deleted");
            }
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}
