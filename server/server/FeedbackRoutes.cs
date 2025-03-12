using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;

public static class FeedbackRoutes{

    public record ratingDTO(
      int rating
      );

    public static async Task<IResult>SendRating(int rating, int ticketId, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"UPDATE ticket
                                                SET rating = $1
                                                WHERE id = $2 RETURNING id;");

        command.Parameters.AddWithValue(rating);
        command.Parameters.AddWithValue(ticketId);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            { 
                reader.GetInt32(0);
                return TypedResults.Ok($"Rating updated to {rating} in ticket #{ticketId}");
            }
            return TypedResults.BadRequest("Failed to rate");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
};
