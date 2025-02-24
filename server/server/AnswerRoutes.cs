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
    int ticketId,
    int questionId,
    string answer
    );

    public static async Task<Results<Created<Answer>, BadRequest<string>>>
    PostAnswer(int ticketId, int questionId, PostAnswerDTO PostAnswerDTO, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"INSERT INTO ticketxquestion (ticket_id, question_id, answer) VALUES ($1, $2, $3) ");
        command.Parameters.AddWithValue("ticket_id", PostAnswerDTO.ticketId);
        command.Parameters.AddWithValue("question_id", PostAnswerDTO.questionId);
        command.Parameters.AddWithValue("answer", PostAnswerDTO.answer);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
           
                return TypedResults.Created($"/api/{answer.ticketId}/{answer.questionId}/postAnswer", Answer);
            }
            return TypedResults.BadRequest("Failed to add questions");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}