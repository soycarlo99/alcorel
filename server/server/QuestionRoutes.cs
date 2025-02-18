using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Server;

public static class QuestionRoutes
{

    public record Question(
        int id,
        string questions,
        int category_id
    );


    public record QuestionDTO(
        int id,
        string questions,
        int category_id
    );

    public record PostQuestionDTO(
        string questions,
        int category_id
    );

    public static async Task<List<QuestionDTO>> GetQuestion(int category_id, NpgsqlDataSource db)
    {
        List<QuestionDTO> result = new();
        using var query = db.CreateCommand("SELECT id, questions, category_id FROM questions WHERE category_id = @category_id");
        query.Parameters.AddWithValue("category_id", category_id);
        using var reader = await query.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new(
                reader.GetInt32(0),
                reader.GetString(1),
                reader.GetInt32(2)
            ));
        }

        return result;
    }


    public static async Task<Results<Created<Question>, BadRequest<string>>> 
        PostQuestions(PostQuestionDTO PostQuestionDTO, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"
            INSERT INTO questions (questions, category_id) 
            VALUES (@questions, @category_id) 
            RETURNING id, questions, category_id");
        
        command.Parameters.AddWithValue("questions", PostQuestionDTO.questions);
        command.Parameters.AddWithValue("category_id", PostQuestionDTO.category_id);

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
