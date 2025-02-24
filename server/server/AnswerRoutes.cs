using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;

public static class AnswerRoutes
{

    public static async Task<Results<Created<Answer>, BadRequest<string>>>
    PostAnswer(PostAnswerDTO PostAnswerDTO, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"
            INSERT INTO questions (questions, category_id) 
            VALUES (@questions, @category_id) 
            RETURNING id, questions, category_id");

        command.Parameters.AddWithValue("questions", PostAnswerDTO.questions);
        command.Parameters.AddWithValue("category_id", PostAnswerDTO.category_id);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var question = new Question(
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetInt32(2)
                );
                return TypedResults.Created($"/api/questions/{question.id}", question);
            }
            return TypedResults.BadRequest("Failed to add questions");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}