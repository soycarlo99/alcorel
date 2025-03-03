using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;

public static class AnswerRoutes
{

    public record Answer(
    int ticketId,
    int questionId,
    string answer
    );

    public record PostAnswerDTO(
    // int ticketId,
    // int questionId,
    string answer
    );

    public static async Task<Results<Ok<string>, BadRequest<string>>>
    PostAnswer(int ticketId, int questionId, PostAnswerDTO PostAnswerDTO, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"INSERT INTO ticketxquestion (ticket_id, question_id, answer) VALUES ($1, $2, $3)");
        command.Parameters.AddWithValue(ticketId);
        command.Parameters.AddWithValue(questionId);
        command.Parameters.AddWithValue(PostAnswerDTO.answer);

        try
        {
            int rowseffected = await command.ExecuteNonQueryAsync();
            if (rowseffected > 0)
            {
                return TypedResults.Ok("The answer added succesfully");
            }
            return TypedResults.BadRequest("Failed to add Answer");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}
