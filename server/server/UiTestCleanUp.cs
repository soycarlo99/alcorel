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
        try
        {
            int ticketsDeleted = 0;
            int usersDeleted = 0;

            using var connection = await db.OpenConnectionAsync();
            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                using var ticketCommand = new NpgsqlCommand(
                    @"DELETE FROM ticket WHERE category_id = 17",
                    connection,
                    transaction
                );

                ticketsDeleted = await ticketCommand.ExecuteNonQueryAsync();

                using var userCommand = new NpgsqlCommand(
                    @"DELETE FROM testuser WHERE email IN ('gui@alcorelteam.testinator.com', 'testament@test.com', 'cj@cj.com')",
                    connection,
                    transaction
                );

                usersDeleted = await userCommand.ExecuteNonQueryAsync();

                await transaction.CommitAsync();

                var message = $"Operation completed successfully. ";
                if (ticketsDeleted > 0)
                    message += $"Deleted {ticketsDeleted} ticket(s). ";
                if (usersDeleted > 0)
                    message += $"Deleted {usersDeleted} user(s).";

                if (ticketsDeleted == 0 && usersDeleted == 0)
                    message = "No records were deleted.";

                return TypedResults.Ok(message);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest($"Error occurred: {ex.Message}");
        }
    }
}
