using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;
using Microsoft.AspNetCore.Mvc;

public static class MessageRoutes
{
    public record Message(
    int id,
    string message
    
);
    public record PostMessageDTO(
    string message,
    DateTime? ticket_time
    );

    public static async Task<Results<Created<Message>, BadRequest<string>>>
    PostMessage(int id, PostMessageDTO PostMessageDTO, NpgsqlDataSource db) 
    {
        
        using var command = db.CreateCommand(@"
            INSERT INTO ticket_messages (ticket_id, message) 
            VALUES (@ticket_id, @message) 
            RETURNING id, message");

        command.Parameters.AddWithValue("ticket_id", id);
        command.Parameters.AddWithValue("message", PostMessageDTO.message);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var message = new Message(
                    reader.GetInt32(0),
                    reader.GetString(1)
                );
                return TypedResults.Created($"/api/questions/{message.id}", message);
            }
            return TypedResults.BadRequest("Failed to add questions");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}
